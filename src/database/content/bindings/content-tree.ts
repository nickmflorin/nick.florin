import {
  type ContentOwnerType,
  NodeKind,
  NodeType,
  type Prisma,
  type SyndicationChannel,
  TitleLayout,
} from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { type ChildCollectionAdapter, reconcileChildren } from '../codecs/child-collection';
import { type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec, recordListField } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  channelsField,
  nullableEnumField,
  nullableProseField,
  nullableStringField,
  slugRefListField,
  visibilityField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { type SlugReference } from './content-binding';

/**
 * The shared two-level content tree of a role or degree, in its authoring shape: `summary` and
 * `content` are separate ordered collections (normalization into one `ContentNode` table stamps
 * `kind` from which collection a node came out of), and the tree-level syndication fields are the
 * owner's own — they map to columns on the `Role`/`Degree` row, not to a row of their own.
 *
 * Node slugs are nullable in the canonical type because they are generated rather than authored:
 * `stampContentTreeSlugs` derives any missing slug, and once a slug has been written back to the
 * fixture it is sticky — a later title edit never changes identity.
 */
export const NestedNodeFields = {
  channels: channelsField(),
  competencies: slugRefListField('competency'),
  content: nullableProseField(),
  isVisible: visibilityField(),
  slug: nullableStringField(),
  title: nullableProseField(),
  titleLayout: nullableEnumField(TitleLayout),
} satisfies FieldCodecRecord;

export const NestedNodeCodec = new RecordCodec(NestedNodeFields);

export const NodeFields = {
  ...NestedNodeFields,
  children: recordListField(NestedNodeCodec),
  type: nullableEnumField(NodeType),
} satisfies FieldCodecRecord;

export const NodeCodec = new RecordCodec(NodeFields);

export const ContentTreeFields = {
  channels: channelsField(),
  competencies: slugRefListField('competency'),
  content: recordListField(NodeCodec),
  isVisible: visibilityField(),
  summary: recordListField(NodeCodec),
} satisfies FieldCodecRecord;

export const ContentTreeCodec = new RecordCodec(ContentTreeFields, { meta: false });

export type CanonicalNestedNode = CanonicalRecord<typeof NestedNodeFields>;
export type CanonicalNode = CanonicalRecord<typeof NodeFields>;
export type CanonicalContentTree = CanonicalRecord<typeof ContentTreeFields>;

const slugifyTitle = (title: string): string =>
  slugify(title.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' '));

const uniqueSlug = (base: string, taken: Set<string>): string => {
  let candidate = base;
  let suffix = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  taken.add(candidate);
  return candidate;
};

const stampNodeSlug = (
  slug: null | string,
  title: null | string,
  fallback: string,
  taken: Set<string>,
): string => {
  if (slug !== null) {
    taken.add(slug);
    return slug;
  }
  return uniqueSlug(title === null ? fallback : slugifyTitle(title), taken);
};

/**
 * Derives a slug for every node that does not already carry one. Top-level slugs are unique per
 * owner (summaries and content share the `ContentNode` table); child slugs are unique per parent.
 */
export const stampContentTreeSlugs = (tree: CanonicalContentTree): CanonicalContentTree => {
  const taken = new Set<string>();
  const stampCollection = (nodes: CanonicalNode[], prefix: string): CanonicalNode[] =>
    nodes.map((node, index) => {
      const slug = stampNodeSlug(node.slug, node.title, `${prefix}-${index + 1}`, taken);
      const childTaken = new Set<string>();
      const children = node.children.map((child, childIndex) => ({
        ...child,
        slug: stampNodeSlug(child.slug, child.title, `${slug}-${childIndex + 1}`, childTaken),
      }));
      return { ...node, children, slug };
    });
  return {
    ...tree,
    content: stampCollection(tree.content, 'content'),
    summary: stampCollection(tree.summary, 'summary'),
  };
};

/**
 * Resolves the channel allowlist of every node that does not author one. An empty `channels` on a
 * node reads as "inherit the parent's" — the fixture authoring shape omits node channels except to
 * narrow — so stamping replaces empty lists with the nearest ancestor's resolved set, rooted at
 * the tree's own (owner-level) channels. A node that should render nowhere authors
 * `isVisible: false` instead of an empty list.
 */
export const stampContentTreeChannels = (tree: CanonicalContentTree): CanonicalContentTree => {
  const resolve = (nodes: CanonicalNode[]): CanonicalNode[] =>
    nodes.map(node => {
      const channels = node.channels.length > 0 ? node.channels : tree.channels;
      return {
        ...node,
        channels,
        children: node.children.map(child => ({
          ...child,
          channels: child.channels.length > 0 ? child.channels : channels,
        })),
      };
    });
  return { ...tree, content: resolve(tree.content), summary: resolve(tree.summary) };
};

const sameChannels = (
  a: readonly SyndicationChannel[],
  b: readonly SyndicationChannel[],
): boolean => a.length === b.length && a.every(channel => b.includes(channel));

/**
 * The inverse of {@link stampContentTreeChannels}: clears a node's channel list when it holds
 * exactly what the node would inherit anyway, so the fixture states a grant only where it narrows.
 *
 * The two are the decode and encode halves of one representation rule. The canonical form always
 * carries every node's fully resolved allowlist — that is what the database rows hold, and what
 * makes a fixture record and a database record comparable — while the fixture carries only the
 * narrowings an author actually wrote. Without this half, serialization would write the resolved
 * set onto every node and the authoring shape would be lost on the first round trip.
 */
export const collapseContentTreeChannels = (tree: CanonicalContentTree): CanonicalContentTree => {
  const collapse = (nodes: CanonicalNode[]): CanonicalNode[] =>
    nodes.map(node => {
      const inherits = sameChannels(node.channels, tree.channels);
      /* A child inherits from its parent's resolved set, which is the parent's own list whether or
         not that list survives collapsing. */
      const parentChannels = node.channels;
      return {
        ...node,
        channels: inherits ? [] : node.channels,
        children: node.children.map(child => ({
          ...child,
          channels: sameChannels(child.channels, parentChannels) ? [] : child.channels,
        })),
      };
    });
  return { ...tree, content: collapse(tree.content), summary: collapse(tree.summary) };
};

/**
 * The invariants of the content tree that its schema cannot express: content is one paragraph per
 * node, summaries are standalone prose, and a node is never a bare title.
 */
export const validateContentTree = (
  entity: string,
  ownerSlug: string,
  tree: CanonicalContentTree,
  issues: IssueCollector,
): void => {
  const validateProse = (content: null | string, where: string): void => {
    if (content !== null && /<p[\s>]/i.test(content)) {
      issues.error(
        entity,
        ownerSlug,
        `The content of ${where} must be a single paragraph; split multiple paragraphs into ` +
          'separate nodes.',
      );
    }
  };
  for (const node of tree.summary) {
    if (node.type !== null || node.children.length > 0) {
      issues.error(
        entity,
        ownerSlug,
        `Summary node '${node.slug ?? '?'}' must be standalone prose: no type, no children.`,
      );
    }
    validateProse(node.content, `summary node '${node.slug ?? '?'}'`);
  }
  for (const node of tree.content) {
    validateProse(node.content, `content node '${node.slug ?? '?'}'`);
    if (node.content === null && node.children.length === 0) {
      issues.error(
        entity,
        ownerSlug,
        `Content node '${node.slug ?? '?'}' would render as a bare title: it has no content and ` +
          'no children.',
      );
    }
    for (const child of node.children) {
      validateProse(child.content, `nested node '${child.slug ?? '?'}'`);
    }
  }
};

export const contentTreeReferences = (tree: CanonicalContentTree): SlugReference[] => {
  const references: SlugReference[] = tree.competencies.map(slug => ({
    entity: 'competency',
    slug,
  }));
  for (const node of [...tree.summary, ...tree.content]) {
    references.push(...node.competencies.map(slug => ({ entity: 'competency', slug })));
    for (const child of node.children) {
      references.push(...child.competencies.map(slug => ({ entity: 'competency', slug })));
    }
  }
  return references;
};

type NodeRow = Prisma.ContentNodeGetPayload<{
  include: {
    children: { include: { competencies: true } };
    competencies: true;
  };
}>;

const fromNestedNodeRow = ({
  competencies,
  createdAt,
  id,
  updatedAt,
  ...row
}: NodeRow['children'][number]): CanonicalNestedNode => ({
  ...omitBookkeeping(row),
  competencies: competencies.map(competency => competency.slug),
  meta: { createdAt, id, updatedAt },
});

const fromNodeRow = ({
  children,
  competencies,
  createdAt,
  id,
  updatedAt,
  ...row
}: NodeRow): CanonicalNode => ({
  ...omitBookkeeping(row),
  children: [...children].sort((a, b) => a.order - b.order).map(child => fromNestedNodeRow(child)),
  competencies: competencies.map(competency => competency.slug),
  meta: { createdAt, id, updatedAt },
});

/**
 * Reads every content node of one owner type, grouped by owner id and split into the summary and
 * content collections in order. The tree's owner-level syndication and competency fields are not
 * populated here — they live on the owner's own row, and the owner's codec fills them in.
 */
export const readContentTrees = async (
  tx: Transaction,
  ownerType: ContentOwnerType,
): Promise<Map<string, Pick<CanonicalContentTree, 'content' | 'summary'>>> => {
  const rows = await tx.contentNode.findMany({
    include: {
      children: { include: { competencies: { orderBy: { slug: 'asc' } } } },
      competencies: { orderBy: { slug: 'asc' } },
    },
    orderBy: { order: 'asc' },
    where: { ownerType },
  });
  const trees = new Map<string, { content: CanonicalNode[]; summary: CanonicalNode[] }>();
  for (const row of rows) {
    const tree = trees.get(row.ownerId) ?? { content: [], summary: [] };
    if (row.kind === NodeKind.SUMMARY) {
      tree.summary.push(fromNodeRow(row));
    } else {
      tree.content.push(fromNodeRow(row));
    }
    trees.set(row.ownerId, tree);
  }
  return trees;
};

const definedSlug = (slug: null | string, where: string): string => {
  if (slug === null) {
    throw new TypeError(
      `Unexpectedly encountered ${where} without a slug: slugs must be stamped before a write.`,
    );
  }
  return slug;
};

const nestedNodeAdapter = (parentId: string): ChildCollectionAdapter<CanonicalNestedNode> => ({
  create: async (tx, child, order, context) => {
    await tx.nestedContentNode.create({
      data: {
        ...omitBookkeeping(child, ['competencies', 'slug']),
        competencies: { connect: child.competencies.map(slug => ({ slug })) },
        createdById: context.userId,
        order,
        parentId,
        slug: definedSlug(child.slug, `a nested node of '${parentId}'`),
        updatedById: context.userId,
      },
    });
  },
  existing: async tx => {
    const rows = await tx.nestedContentNode.findMany({
      select: { id: true, slug: true },
      where: { parentId },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.nestedContentNode.delete({ where: { id } });
  },
  slugOf: child => definedSlug(child.slug, `a nested node of '${parentId}'`),
  update: async (tx, id, child, order, context) => {
    await tx.nestedContentNode.update({
      data: {
        ...omitBookkeeping(child, ['competencies', 'slug']),
        competencies: { set: child.competencies.map(slug => ({ slug })) },
        order,
        updatedById: context.userId,
      },
      where: { id },
    });
  },
});

/**
 * One top-level node paired with the collection it came out of, which is what the single
 * `ContentNode` table stores as `kind`.
 */
interface PlannedNode {
  readonly kind: NodeKind;
  readonly node: CanonicalNode;
}

const contentNodeAdapter = (
  ownerId: string,
  ownerType: ContentOwnerType,
): ChildCollectionAdapter<PlannedNode> => ({
  create: async (tx, { kind, node }, order, context) => {
    const created = await tx.contentNode.create({
      data: {
        ...omitBookkeeping(node, ['children', 'competencies', 'slug']),
        competencies: { connect: node.competencies.map(slug => ({ slug })) },
        createdById: context.userId,
        kind,
        order,
        ownerId,
        ownerType,
        slug: definedSlug(node.slug, `a ${kind} node of owner '${ownerId}'`),
        updatedById: context.userId,
      },
    });
    await reconcileChildren(tx, node.children, nestedNodeAdapter(created.id), context);
  },
  existing: async tx => {
    const rows = await tx.contentNode.findMany({
      select: { id: true, slug: true },
      where: { ownerId, ownerType },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.contentNode.delete({ where: { id } });
  },
  slugOf: ({ node }) => definedSlug(node.slug, `a node of owner '${ownerId}'`),
  update: async (tx, id, { kind, node }, order, context) => {
    await tx.contentNode.update({
      data: {
        ...omitBookkeeping(node, ['children', 'competencies', 'slug']),
        competencies: { set: node.competencies.map(slug => ({ slug })) },
        kind,
        order,
        updatedById: context.userId,
      },
      where: { id },
    });
    await reconcileChildren(tx, node.children, nestedNodeAdapter(id), context);
  },
});

/**
 * Brings one owner's `ContentNode`/`NestedContentNode` rows to the state the tree describes,
 * correlating rows by their stamped slug so that a node surviving an edit keeps its row identity
 * and creation date.
 *
 * The two collections are reconciled as one sequence because they share the table and the slug
 * namespace: `kind` records which collection a node came out of, and `order` runs across the
 * concatenation. Reading splits by kind and preserves relative order, so summaries ordered ahead of
 * content is immaterial to how either renders.
 */
export const reconcileContentNodes = async (
  tx: Transaction,
  ownerId: string,
  ownerType: ContentOwnerType,
  tree: CanonicalContentTree,
  context: PrismaWriteContext,
): Promise<void> => {
  const planned: PlannedNode[] = [
    ...tree.summary.map(node => ({ kind: NodeKind.SUMMARY, node })),
    ...tree.content.map(node => ({ kind: NodeKind.CONTENT, node })),
  ];
  await reconcileChildren(tx, planned, contentNodeAdapter(ownerId, ownerType), context);
};

/**
 * Removes every content node of one owner.
 *
 * Content nodes attach polymorphically, through an `ownerId`/`ownerType` pair rather than a foreign
 * key, so deleting the owning role or degree does not cascade to them. Without this they would
 * outlive their owner and reappear as orphans on the next read.
 */
export const deleteContentNodes = async (
  tx: Transaction,
  ownerId: string,
  ownerType: ContentOwnerType,
): Promise<void> => {
  await tx.contentNode.deleteMany({ where: { ownerId, ownerType } });
};
