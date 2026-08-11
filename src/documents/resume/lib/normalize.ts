/**
 * Normalization: authoring input in, content model out.
 *
 * The model types in `src/documents/resume/data/types.ts` are shaped as Prisma models, which means
 * a non-null `slug`, `order`, `isVisible` and `channels` on every node: correct for a database and
 * miserable to write by hand. The data files are therefore authored against the `*Input` types,
 * and this module is the single boundary that turns them into `ContentOwner`s. It generates slugs,
 * stamps `order` from array position, applies the defaults, resolves each node's channel allowlist
 * (an omitted `channels` inherits the parent's; an authored one may only narrow it), and collapses
 * the whitespace of copy authored as indented template literals.
 *
 * It also enforces the invariants Postgres cannot (see the `resume-gen` repository's
 * `docs/content-model.md`), loudly. A data file that violates one fails the build rather than
 * rendering something subtly wrong.
 *
 * This module WRITES `isVisible` and `channels`; it never reads them to decide anything. That
 * decision lives in exactly one place, `resolveSyndication` in `./syndication.ts`.
 */
import {
  type ContentInput,
  type ContentNode,
  type ContentOwner,
  type ContentOwnerInput,
  type ContentOwnerType,
  type NestedContentNode,
  type NestedNodeInput,
  type NodeInput,
  NodeKind,
  type Resolved,
  type SyndicationChannel,
} from '../data/types';

import { slugify } from './slugs';
import { resolveSyndication } from './syndication';

/* Copy carries inline HTML (<em>, <strong>, <code>) and is authored as indented template literals
   in the data files, so the authoring whitespace is collapsed here, once, rather than at every
   render site. */
const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * A slug unique within one parent, which is the grain the model's unique constraints are declared
 * at. A generated slug for an arbitrary paragraph is only meaningful in the context of the thing it
 * hangs off, so collisions across different roles are fine and expected; collisions within one are
 * de-duplicated with a numeric suffix.
 *
 * Untitled nodes (every summary paragraph, for instance) fall back to a positional slug.
 */
function uniqueSlug(title: null | string, fallback: string, taken: Set<string>): string {
  const base = title === null ? '' : slugify(title);
  let slug = base === '' ? fallback : base;
  for (let n = 2; taken.has(slug); n++) {
    slug = `${base === '' ? fallback : base}-${n}`;
  }
  taken.add(slug);
  return slug;
}

/**
 * Invariant 4: `content` is a SINGLE paragraph. Several paragraphs are several nodes.
 */
function assertSingleParagraph(content: string, where: string): void {
  if (/<\/?p[\s/>]/i.test(content)) {
    throw new Error(
      `${where}: content holds a <p> tag, so it is more than one paragraph. Per-paragraph ` +
        'syndication is the entire point of the model; author one node per paragraph instead.',
    );
  }
}

/**
 * Invariant 5: a node may only NARROW its parent's channel grants. A channel listed here that the
 * parent does not carry could never render — the cascade masks it anyway — so the useless grant
 * makes the data lie about intent, and it fails here.
 *
 * Returns the node's effective allowlist: the authored value when present, otherwise the parent's.
 */
function resolveChannels(
  own: readonly SyndicationChannel[] | undefined,
  inherited: readonly SyndicationChannel[],
  where: string,
): readonly SyndicationChannel[] {
  if (own === undefined) {
    return inherited;
  }
  const useless = own.filter(channel => !inherited.includes(channel));
  if (useless.length > 0) {
    throw new Error(
      `${where}: grants ${useless.join(', ')}, which the parent does not carry. A node can only ` +
        "narrow its parent's channels; a grant the cascade would mask is noise.",
    );
  }
  return own;
}

function normalizeNested(
  input: NestedNodeInput,
  order: number,
  parentPath: string,
  inherited: readonly SyndicationChannel[],
  taken: Set<string>,
): NestedContentNode {
  const title = input.title === undefined ? null : collapse(input.title);
  const content = input.content === undefined ? null : collapse(input.content);
  const slug = uniqueSlug(title, `item-${order + 1}`, taken);
  const where = `${parentPath}/${slug}`;

  if (content !== null) {
    assertSingleParagraph(content, where);
  }
  const channels = resolveChannels(input.channels, inherited, where);

  return {
    channels,
    competencies: input.competencies ?? [],
    content,
    isVisible: input.isVisible ?? true,
    order,
    slug,
    title,
    titleLayout: input.titleLayout ?? null,
  };
}

function normalizeNode(
  input: NodeInput,
  order: number,
  kind: NodeKind,
  ownerSlug: string,
  ownerType: ContentOwnerType,
  inherited: readonly SyndicationChannel[],
  taken: Set<string>,
): ContentNode {
  const title = input.title === undefined ? null : collapse(input.title);
  const content = input.content === undefined ? null : collapse(input.content);
  const fallback = `${kind === NodeKind.Summary ? 'summary' : 'content'}-${order + 1}`;
  const slug = uniqueSlug(title, fallback, taken);
  const path = `${ownerSlug}/${slug}`;

  /* Invariants 2 and 3: a summary is always standalone prose. This is the guarantee given up by
     folding summaries into `ContentNode` instead of a third model, and this is where it is paid
     back. */
  if (kind === NodeKind.Summary && input.type !== undefined) {
    throw new Error(`${path}: a summary never carries a type; it is always standalone prose.`);
  }
  if (kind === NodeKind.Summary && input.children !== undefined) {
    throw new Error(`${path}: a summary never has children; author it as content instead.`);
  }
  if (content !== null) {
    assertSingleParagraph(content, path);
  }
  const channels = resolveChannels(input.channels, inherited, path);

  const childSlugs = new Set<string>();

  return {
    channels,
    children: (input.children ?? []).map((child, index) =>
      normalizeNested(child, index, path, channels, childSlugs),
    ),
    competencies: input.competencies ?? [],
    content,
    isVisible: input.isVisible ?? true,
    kind,
    order,
    ownerType,
    slug,
    title,
    titleLayout: input.titleLayout ?? null,
    type: input.type ?? null,
  };
}

/**
 * Turn one role's or degree's authored content into a {@link ContentOwner}.
 *
 * Node slugs are generated as paths beneath the owner's authored slug, so every slug in the tree is
 * deterministic and reproducible across builds. A generated uuid would churn the whole tree on
 * every run, which is exactly why the database id is not what anything is keyed off.
 */
export function normalizeOwner(
  slug: string,
  ownerType: ContentOwnerType,
  input: ContentInput,
): ContentOwner {
  /* Summaries and content share one `nodes` collection because they are one table, and one slug
     namespace because they share the `@@unique([slug, ownerId, ownerType])` key. */
  const taken = new Set<string>();
  const summary = (input.summary ?? []).map((node, index) =>
    normalizeNode(node, index, NodeKind.Summary, slug, ownerType, input.channels, taken),
  );
  const content = (input.content ?? []).map((node, index) =>
    normalizeNode(node, index, NodeKind.Content, slug, ownerType, input.channels, taken),
  );

  return {
    channels: input.channels,
    competencies: input.competencies ?? [],
    isVisible: input.isVisible ?? true,
    nodes: [...summary, ...content],
    ownerType,
    slug,
  };
}

/**
 * Normalize and resolve a list of roles or degrees for one channel, dropping any withheld from it.
 *
 * This is the whole pipeline in one call, and the only way content reaches a component: the
 * authored {@link ContentInput} is replaced by a resolved tree, so an unresolved one cannot be
 * rendered by accident.
 */
export function resolveContent<T extends ContentOwnerInput>(
  items: readonly T[],
  ownerType: ContentOwnerType,
  channel: SyndicationChannel,
): Resolved<T>[] {
  return items.flatMap(item => {
    const owner = resolveSyndication(normalizeOwner(item.slug, ownerType, item.content), channel);
    if (owner === null) {
      return [];
    }
    const { content: _content, ...rest } = item;
    return [{ ...rest, content: owner }];
  });
}
