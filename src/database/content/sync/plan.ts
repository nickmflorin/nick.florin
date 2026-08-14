import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type IssueCollector } from '../issues';
import { type AnyContentBinding } from '../registry';
import { type EntityWritePlan } from '../stores/content-store';

import { diffRecords, type LeafChange } from './diff';

/**
 * One source record, correlated against the target and diffed against it. Structurally a write
 * plan, with the changes that justify it attached so that the same object drives both the
 * confirmation output and the write.
 */
export interface PlannedRecord<TFields extends SluggedFieldCodecRecord> {
  readonly action: 'create' | 'unchanged' | 'update';
  readonly changes: readonly LeafChange[];
  readonly existing: null | ParsedRecord<TFields>;
  readonly index: number;
  readonly record: ParsedRecord<TFields>;
  readonly slug: string;
}

/**
 * Everything one entity's sync would do: the fate of every source record, and the target records
 * the source no longer describes — split by whether the entity's deletion policy permits removing
 * them.
 */
export interface EntityChangeSet<TFields extends SluggedFieldCodecRecord> {
  readonly binding: ContentBinding<TFields>;
  /**
   * Target records the source no longer describes, which will be removed.
   */
  readonly deletions: readonly ParsedRecord<TFields>[];
  /**
   * Target records the source no longer describes but which are retained, because the entity
   * shares its table with a superseded model whose rows hold required references onto them.
   */
  readonly orphans: readonly ParsedRecord<TFields>[];
  readonly records: readonly PlannedRecord<TFields>[];
  /**
   * How many differences between the two sides this direction would not write, because the target
   * store does not own those fields. Reported as a count rather than itemized: for the reused
   * legacy models the divergence is permanent and expected, so listing it every run would be noise.
   */
  readonly unwritable: number;
}

export type AnyEntityChangeSet = EntityChangeSet<SluggedFieldCodecRecord>;

/**
 * Indexes the target side by every key a source record might correlate on: each record's own slug,
 * and the alternate keys its binding declares for rows that predate the slug column.
 */
const indexTarget = <TFields extends SluggedFieldCodecRecord>(
  binding: ContentBinding<TFields>,
  records: readonly ParsedRecord<TFields>[],
): Map<string, ParsedRecord<TFields>> => {
  const index = new Map<string, ParsedRecord<TFields>>();
  for (const record of records) {
    index.set(binding.slugOf(record), record);
  }
  for (const record of records) {
    for (const key of binding.alternateKeys(record)) {
      if (!index.has(key)) {
        index.set(key, record);
      }
    }
  }
  return index;
};

/**
 * The top-level field a leaf path addresses, which is the granularity a store declares its writable
 * fields at — `content.summary[opening].title` is owned or not owned as part of `content`.
 */
const rootOf = (path: string): string => path.split(/[.[]/)[0] ?? path;

const correlate = <TFields extends SluggedFieldCodecRecord>(
  binding: ContentBinding<TFields>,
  record: ParsedRecord<TFields>,
  index: Map<string, ParsedRecord<TFields>>,
  target: readonly ParsedRecord<TFields>[],
): null | ParsedRecord<TFields> => {
  /* A singleton entity has exactly one row by definition, so the row it correlates to is that row,
     whatever either side calls it. Correlating a singleton by slug would report the profile as
     both a creation and an orphan the first time a slug is authored for it. */
  if (binding.fixtureShape === 'single') {
    return target.at(0) ?? null;
  }
  const keys = [binding.slugOf(record), ...binding.alternateKeys(record)];
  for (const key of keys) {
    const found = index.get(key);
    if (found !== undefined) {
      return found;
    }
  }
  return null;
};

/**
 * Correlates one entity's source records against the target's and diffs each pair, producing the
 * complete set of changes a sync of that entity would apply.
 *
 * Nothing here writes or queries: the change set is computed entirely from two already-read
 * collections, which is what allows the whole plan to be assembled, reviewed and confirmed before a
 * transaction is opened.
 */
export const planEntity = <TFields extends SluggedFieldCodecRecord>(
  binding: ContentBinding<TFields>,
  source: readonly ParsedRecord<TFields>[],
  target: readonly ParsedRecord<TFields>[],
  issues: IssueCollector,
  writable: null | readonly string[] = null,
): EntityChangeSet<TFields> => {
  const index = indexTarget(binding, target);
  const claimed = new Set<ParsedRecord<TFields>>();
  let unwritable = 0;

  const records = source.map((record, position): PlannedRecord<TFields> => {
    const existing = correlate(binding, record, index, target);
    const slug = binding.slugOf(record);
    if (existing !== null) {
      claimed.add(existing);
    }
    const found =
      existing === null ? [] : diffRecords(binding.serialize(existing), binding.serialize(record));
    const changes =
      writable === null ? found : found.filter(change => writable.includes(rootOf(change.path)));
    unwritable += found.length - changes.length;
    const targetIdentity = existing?.meta?.id;
    const sourceIdentity = record.meta?.id;
    if (
      targetIdentity !== undefined &&
      sourceIdentity !== undefined &&
      targetIdentity !== sourceIdentity
    ) {
      issues.warning(
        binding.key,
        slug,
        `The source record carries the identity '${sourceIdentity}' but correlates by slug to ` +
          `the row '${targetIdentity}'. One of them has been re-pointed at a different record; ` +
          'the slug correlation is what the write will follow.',
      );
    }
    return {
      action: existing === null ? 'create' : changes.length === 0 ? 'unchanged' : 'update',
      changes,
      existing,
      index: position,
      record,
      slug,
    };
  });

  const absent = target.filter(record => !claimed.has(record));
  const removable = binding.prisma.deletionPolicy === 'delete';
  if (!removable) {
    for (const record of absent) {
      issues.warning(
        binding.key,
        binding.slugOf(record),
        'The record exists in the target but not in the source, and this entity cannot be ' +
          'deleted by a sync because a superseded model still holds a required reference onto ' +
          'it. It is left in place.',
      );
    }
  }
  for (const planned of records) {
    binding.prisma.planIssues(planned, issues);
  }

  return {
    binding,
    deletions: removable ? absent : [],
    orphans: removable ? [] : absent,
    records,
    unwritable,
  };
};

/**
 * Reduces a change set to the write plan its store consumes, dropping the review metadata the
 * stores have no use for.
 */
export const toWritePlan = <TFields extends SluggedFieldCodecRecord>(
  changeSet: EntityChangeSet<TFields>,
): EntityWritePlan<TFields> => ({
  deletions: changeSet.deletions,
  records: changeSet.records,
});

/**
 * Whether a change set would write anything at all, which is what decides between opening a
 * transaction and reporting that the two sides already agree.
 */
export const hasChanges = (changeSet: AnyEntityChangeSet): boolean =>
  changeSet.deletions.length > 0 || changeSet.records.some(record => record.action !== 'unchanged');

/**
 * Every binding in dependency order, which is a valid write order because a binding appears after
 * everything it references.
 */
export const orderedBindings = (
  bindings: readonly AnyContentBinding[],
  only: readonly string[],
): readonly AnyContentBinding[] =>
  only.length === 0 ? bindings : bindings.filter(binding => only.includes(binding.key));
