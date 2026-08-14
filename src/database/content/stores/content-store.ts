import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type RecordWritePlan } from '../codecs/prisma-codec';
import { type IssueCollector } from '../issues';

/**
 * The complete set of changes one entity's write applies: every record the target should hold
 * afterwards, in source order and each carrying how it correlates to the target, plus the records
 * the target holds today that the source no longer describes.
 *
 * A store receives the whole entity at once rather than a record at a time because the two adapters
 * need different halves of it — the fixture adapter rewrites a file from `records` and gets
 * deletion for free, while the database adapter applies each record individually and must be told
 * explicitly what to remove.
 */
export interface EntityWritePlan<TFields extends SluggedFieldCodecRecord> {
  readonly deletions: readonly ParsedRecord<TFields>[];
  readonly records: readonly RecordWritePlan<ParsedRecord<TFields>>[];
}

/**
 * The plan that states one entity's content wholesale: every record written in the order given,
 * with nothing correlated against a target. This is what a caller emitting a fixture file from
 * scratch needs, where there is no target side to diff against.
 */
export const replaceAll = <TFields extends SluggedFieldCodecRecord>(
  records: readonly ParsedRecord<TFields>[],
): EntityWritePlan<TFields> => ({
  deletions: [],
  records: records.map((record, index) => ({
    action: 'create',
    existing: null,
    index,
    record,
  })),
});

/**
 * The storage port of the transfer system: one side of a sync, able to read and write the
 * canonical records of any bound entity. The YAML fixture directory and the database each
 * implement it, which is what makes push and pull the same operation with source and target
 * swapped — and what gives the diff-and-confirm engine a single seam to slot into.
 */
export interface ContentStore {
  read<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    issues: IssueCollector,
  ): Promise<ParsedRecord<TFields>[]>;

  /**
   * The record fields a write to this store applies, or `null` when it applies all of them.
   *
   * A diff is only worth confirming if it describes what the write will do. Rewriting a fixture
   * file applies everything, while a push to a reused legacy model deliberately touches only the
   * columns the new model adds — so the same pair of records yields a different, and differently
   * alarming, diff depending on which way the content is moving.
   */
  writableFields<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
  ): null | readonly string[];

  write<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    plan: EntityWritePlan<TFields>,
    issues: IssueCollector,
  ): Promise<void>;
}
