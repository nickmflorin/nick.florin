import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type IssueCollector } from '../issues';

/**
 * The storage port of the transfer system: one side of a sync, able to read and write the
 * canonical records of any bound entity. The YAML fixture directory and the database each
 * implement it, which is what makes push and pull the same operation with source and target
 * swapped — and what gives the future diff-and-confirm engine a single seam to slot into.
 */
export interface ContentStore {
  read<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    issues: IssueCollector,
  ): Promise<ParsedRecord<TFields>[]>;

  write<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    records: readonly ParsedRecord<TFields>[],
    issues: IssueCollector,
  ): Promise<void>;
}
