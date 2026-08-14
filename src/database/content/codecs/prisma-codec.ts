import { type Transaction } from '~/database/prisma';

import { type IssueCollector } from '../issues';
import { type LegacyCreatedAtResolver } from '../legacy-created-at';

import { type RecordIdentity } from './meta';

/**
 * The authorship context every database write requires: the user the created/updated audit
 * relations point at, and the resolver that supplies a newly created record's inherited creation
 * timestamp. Injected by the store so that codecs stay ignorant of how either is obtained.
 */
export interface PrismaWriteContext {
  readonly inheritedCreatedAt: LegacyCreatedAtResolver;
  readonly userId: string;
}

/**
 * What the engine determined about one record before any write: which side of the create/update
 * split it falls on, the target-side record it correlates to by slug, and its position in the
 * source collection — which is the source of every `order` column.
 *
 * The correlation is computed once, outside the transaction, so that a codec never has to look up
 * the row it is about to write and the diff the operator confirmed is exactly the set of writes
 * that follow.
 */
export interface RecordWritePlan<TCanonical> {
  readonly action: 'create' | 'unchanged' | 'update';
  readonly existing: null | TCanonical;
  readonly index: number;
  readonly record: TCanonical;
}

/**
 * The database id of the row a planned update targets.
 *
 * Reads always populate `meta`, so a record correlated as the target side of a write necessarily
 * carries an identity; encountering one that does not means a record that never came from a
 * database row was planned as an update target, which is a programming error rather than a data
 * problem and so throws rather than collecting an issue.
 */
export const targetId = (
  entity: string,
  existing: { readonly meta: null | RecordIdentity; readonly slug: string },
): string => {
  if (existing.meta === null) {
    throw new TypeError(
      `The ${entity} record '${existing.slug}' is planned as an update but carries no database ` +
        'identity: only a record read from the database can be the target of one.',
    );
  }
  return existing.meta.id;
};

/**
 * A model whose rows can be looked up by slug, which is every model a structural relation of the
 * content system points at.
 */
interface SluggedDelegate {
  findUniqueOrThrow(args: {
    readonly select: { readonly id: true };
    readonly where: { readonly slug: string };
  }): Promise<{ readonly id: string }>;
}

/**
 * Resolves the row id a slug reference names, for a write that must set a foreign key as a scalar.
 *
 * An update cannot express a structural relation as a nested `connect` here: doing so selects
 * Prisma's checked update input, which omits the scalar audit columns, and the client's metadata
 * middleware requires `updatedById` to be present on every update. Setting the foreign key directly
 * keeps the whole payload scalar and satisfies both.
 */
export const idOfSlug = async (delegate: SluggedDelegate, slug: string): Promise<string> =>
  (await delegate.findUniqueOrThrow({ select: { id: true }, where: { slug } })).id;

/**
 * The database-side codec for one entity: reads rows (with whatever includes and assembly the
 * entity needs) into canonical records, and writes canonical records back as rows. An aggregate's
 * codec owns the whole aggregate — a role's codec reads and writes its content tree, not just the
 * `Role` row — so a caller never observes a partially transferred record.
 */
export abstract class PrismaCodec<TCanonical> {
  /**
   * Whether records present in the database and absent from the source may be deleted.
   *
   * `retain` for every entity whose table is shared with a superseded model, because a legacy row
   * holds a required foreign key onto it and the delete would fail rather than cascade. Those
   * absences are reported as warnings instead.
   */
  public readonly deletionPolicy: 'delete' | 'retain' = 'retain';
  /**
   * The record fields a write actually applies, or `null` when it applies all of them.
   *
   * The codecs of the reused legacy models deliberately write only the columns the new model adds,
   * leaving the rest to the legacy application that owns them. Declaring that here is what keeps
   * the confirmation diff honest: without it a push would report clearing every legacy column the
   * fixture does not carry, none of which it would actually touch, and a destructive section full
   * of changes that never happen is one an operator learns to skip past.
   */
  public readonly writableFields: null | readonly string[] = null;

  /**
   * Deletes one record and everything it owns.
   *
   * Reachable only when {@link PrismaCodec.deletionPolicy} is `delete`; the base throws because
   * planning filters on the policy before any write is attempted, so arriving here at all means
   * the policy and the implementation disagree.
   */
  public delete(
    _tx: Transaction,
    _record: TCanonical,
    _context: PrismaWriteContext,
  ): Promise<void> {
    throw new TypeError(
      'This entity does not support deletion, yet a deletion was planned for it: its deletion ' +
        'policy and its codec disagree.',
    );
  }

  /**
   * Refusals the codec would otherwise discover mid-write, reported while the change set is still
   * being planned so that an unsatisfiable plan fails before the transaction opens rather than
   * after earlier records have already been written.
   */
  public planIssues(_plan: RecordWritePlan<TCanonical>, _issues: IssueCollector): void {
    return undefined;
  }

  public abstract read(tx: Transaction, issues: IssueCollector): Promise<TCanonical[]>;

  /**
   * Applies one planned write. The plan states whether the record is being created or updated, so
   * the codec never queries for the row it is about to write.
   */
  public abstract write(
    tx: Transaction,
    plan: RecordWritePlan<TCanonical>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void>;
}
