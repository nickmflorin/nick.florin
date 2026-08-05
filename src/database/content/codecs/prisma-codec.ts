import { type Transaction } from '~/database/prisma';

import { type IssueCollector } from '../issues';

/**
 * The authorship context every database write requires: the user the created/updated audit
 * relations point at. Injected by the store so that codecs stay ignorant of how it is obtained.
 */
export interface PrismaWriteContext {
  readonly userId: string;
}

/**
 * The database-side codec for one entity: reads rows (with whatever includes and assembly the
 * entity needs) into canonical records, and writes canonical records back as rows. An aggregate's
 * codec owns the whole aggregate — a role's codec reads and writes its content tree, not just the
 * `Role` row — so a caller never observes a partially transferred record.
 *
 * Writes are create-only for now: the parallel tables start empty, and the update/diff mechanics
 * belong to the sync engine that arrives with the script phase.
 */
export abstract class PrismaCodec<TCanonical> {
  public abstract create(
    tx: Transaction,
    record: TCanonical,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void>;

  public abstract read(tx: Transaction, issues: IssueCollector): Promise<TCanonical[]>;
}
