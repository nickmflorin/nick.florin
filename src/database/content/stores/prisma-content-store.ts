import { isEqual } from 'lodash-es';

import { type Transaction } from '~/database/prisma';

import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type PrismaWriteContext } from '../codecs/prisma-codec';
import { type IssueCollector } from '../issues';

import { type ContentStore, type EntityWritePlan } from './content-store';

/**
 * The top-level fields a normalization pass altered, which are exactly the fields where the stored
 * row holds something the canonical form cannot express — a date carrying a time of day, prose the
 * decode half collapses. Reported rather than silently accepted, because the difference is real and
 * a diff computed on normalized records cannot show it.
 */
/**
 * The width a reported failure is folded to. A schema rejection carries its full detail as
 * pretty-printed JSON, which buries the one line that matters when a run reports dozens of them.
 */
const MessageWidth = 160;

const summarize = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  const collapsed = message.replace(/\s+/g, ' ').trim();
  return collapsed.length > MessageWidth ? `${collapsed.slice(0, MessageWidth - 1)}…` : collapsed;
};

/**
 * Normalizes a record read from the database, falling back to the record as read when it cannot be
 * normalized at all.
 *
 * A row can hold a state the canonical model has no way to express — a course whose degree has not
 * been assigned yet, where the fixture requires one — and re-parsing it then fails. That is a real
 * fact about the data rather than a reason to abandon the run: the record still has to appear in
 * the diff, because the difference between it and the source is exactly the gap a sync would close.
 */
const normalizeOrReport = <TFields extends SluggedFieldCodecRecord>(
  binding: ContentBinding<TFields>,
  record: ParsedRecord<TFields>,
  issues: IssueCollector,
): ParsedRecord<TFields> => {
  try {
    return binding.normalize(record, issues);
  } catch (error) {
    issues.warning(
      binding.key,
      binding.slugOf(record),
      'The stored row cannot be expressed in canonical form, so it is compared as read: ' +
        summarize(error),
    );
    return record;
  }
};

const driftingFields = (before: object, after: object): string[] => {
  /* The mapped record types cannot be indexed by a runtime key; both objects are the same entity's
     canonical shape, so the paired lookups hold by construction. */
  const from = before as Record<string, unknown>;
  const to = after as Record<string, unknown>;
  return Object.keys(to).filter(key => !isEqual(from[key], to[key]));
};

/**
 * The database adapter of the {@link ContentStore} port. Constructed over an open transaction so
 * that a caller transferring several entities commits everything or nothing, and over the write
 * context that supplies the audit user.
 */
export class PrismaContentStore implements ContentStore {
  private readonly context: PrismaWriteContext;
  private readonly tx: Transaction;

  constructor(tx: Transaction, context: PrismaWriteContext) {
    this.context = context;
    this.tx = tx;
  }

  /**
   * Reads every record of the entity, normalized so that it is canonical in the same sense a
   * record parsed from a fixture is. The codec assembles records straight from rows without running
   * the field codecs' decode halves, so a value that only differs in a representation the decode
   * would have settled — uncollapsed prose, a date carrying a time — would otherwise diff against
   * an identical fixture value.
   */
  public async read<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    issues: IssueCollector,
  ): Promise<ParsedRecord<TFields>[]> {
    const records = await binding.prisma.read(this.tx, issues);
    return records.map(record => {
      const normalized = normalizeOrReport(binding, record, issues);
      if (normalized === record) {
        return record;
      }
      const drifted = driftingFields(record, normalized);
      if (drifted.length > 0) {
        issues.warning(
          binding.key,
          binding.slugOf(record),
          `The stored row is not canonical in ${drifted.join(', ')}, so normalizing it for ` +
            'comparison discarded information the database holds. A push will overwrite the ' +
            'stored value with the canonical one without the change appearing in the diff.',
        );
      }
      return normalized;
    });
  }

  public writableFields<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
  ): null | readonly string[] {
    return binding.prisma.writableFields;
  }

  /**
   * Applies one entity's planned changes: removals first, so that a slug released by one record and
   * claimed by another cannot collide on a unique constraint, then every write in dependency and
   * source order.
   */
  public async write<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    plan: EntityWritePlan<TFields>,
    issues: IssueCollector,
  ): Promise<void> {
    for (const record of plan.deletions) {
      /* eslint-disable-next-line no-await-in-loop -- Records are written in order inside one
         interactive transaction, which does not support concurrent operations. */
      await binding.prisma.delete(this.tx, record, this.context);
    }
    /* Records the diff found unchanged are written anyway, because "unchanged" is a statement about
       canonical forms and not about what the row holds. A read may supply a value the row does not
       — a company whose slug is still null reads as its derived slug — and such a record compares
       equal to the fixture while the column it correlates on is still empty. Skipping it leaves a
       later record's `connect` with nothing to find. The writes are idempotent updates, so paying
       for them is cheaper than reasoning about which fabrications are safe to skip. */
    for (const record of plan.records) {
      /* eslint-disable-next-line no-await-in-loop -- See above. */
      await binding.prisma.write(this.tx, record, this.context, issues);
    }
  }
}
