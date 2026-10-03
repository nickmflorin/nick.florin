import { type Budget, type Cooldown, type Posting, type Run } from '../schemas';

/**
 * Why a file in a ledger directory was left out of a listing rather than read as a record.
 *
 * `not-downloaded` is an iCloud placeholder for a file that has been evicted from local storage,
 * `conflict-copy` is a second version iCloud kept when two writes collided, and `unrecognized` is
 * anything else that does not belong in the directory. Each is reported rather than ignored,
 * because each hides a record the listing would otherwise be missing.
 */
export const SkippedLedgerFileReasons = [
  'conflict-copy',
  'not-downloaded',
  'unrecognized',
] as const;

export type SkippedLedgerFileReason = (typeof SkippedLedgerFileReasons)[number];

export interface SkippedLedgerFile {
  readonly file: string;
  readonly reason: SkippedLedgerFileReason;
}

export interface LedgerListing<T> {
  readonly records: T[];
  readonly skipped: SkippedLedgerFile[];
}

/**
 * The storage port through which the job-search tooling reads and writes its ledger: every posting
 * seen, every run, each day's LinkedIn activity, and any active cooldown.
 *
 * The tooling depends only on this port, so that the backing store can change — from YAML files in
 * the private data directory to a database — without touching the code that reads and writes it.
 */
export interface LedgerStore {
  /**
   * Reads the activity recorded for a local date, of the form `2026-10-03`, or `null` when nothing
   * has been recorded for it.
   */
  getBudget(date: string): Promise<Budget | null>;
  /**
   * Reads the active cooldown, or `null` when LinkedIn runs are not suspended.
   */
  getCooldown(): Promise<Cooldown | null>;
  getPosting(id: string): Promise<null | Posting>;
  getRun(id: string): Promise<null | Run>;
  /**
   * Lists every recorded posting, together with any file in the postings directory that could not
   * be read as one.
   */
  listPostings(): Promise<LedgerListing<Posting>>;
  listRuns(): Promise<LedgerListing<Run>>;
  putBudget(budget: Budget): Promise<void>;
  /**
   * Records a cooldown, or clears the active one when given `null`.
   */
  putCooldown(cooldown: Cooldown | null): Promise<void>;
  putPosting(posting: Posting): Promise<void>;
  putRun(run: Run): Promise<void>;
}
