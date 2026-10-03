import fs from 'node:fs/promises';
import path from 'node:path';

import {
  type Budget,
  BudgetSchema,
  type Cooldown,
  CooldownSchema,
  LinkedInJobIdPattern,
  LocalDatePattern,
  type Posting,
  PostingSchema,
  type Run,
  RunIdPattern,
  RunSchema,
} from '../schemas';

import { type LedgerListing, type LedgerStore } from './ledger-store';
import { readYamlRecord, writeYamlRecord, YamlRecordDirectory } from './yaml-records';

/**
 * The directory, inside the job-search data directory, that holds the ledger.
 */
export const LedgerDirectoryName = 'ledger';

/**
 * The ledger as YAML files in the private job-search data directory:
 *
 * ```text
 * ledger/
 *   postings/{id}.yaml
 *   runs/{id}.yaml
 *   budget/{date}.yaml
 *   cooldown.yaml
 * ```
 *
 * Each record is a small file written by one machine, which is what makes the layout safe to sync
 * through iCloud.
 */
export class YamlLedgerStore implements LedgerStore {
  private readonly budgets: YamlRecordDirectory<Budget>;
  private readonly cooldownFile: string;
  private readonly postings: YamlRecordDirectory<Posting>;
  private readonly runs: YamlRecordDirectory<Run>;

  constructor(dataDirectory: string) {
    const ledger = path.join(dataDirectory, LedgerDirectoryName);
    this.budgets = new YamlRecordDirectory<Budget>({
      directory: path.join(ledger, 'budget'),
      keyOf: budget => budget.date,
      keyPattern: LocalDatePattern,
      schema: BudgetSchema,
    });
    this.cooldownFile = path.join(ledger, 'cooldown.yaml');
    this.postings = new YamlRecordDirectory<Posting>({
      directory: path.join(ledger, 'postings'),
      keyOf: posting => posting.id,
      keyPattern: LinkedInJobIdPattern,
      schema: PostingSchema,
    });
    this.runs = new YamlRecordDirectory<Run>({
      directory: path.join(ledger, 'runs'),
      keyOf: run => run.id,
      keyPattern: RunIdPattern,
      schema: RunSchema,
    });
  }

  public getBudget(date: string): Promise<Budget | null> {
    return this.budgets.get(date);
  }

  public getCooldown(): Promise<Cooldown | null> {
    return readYamlRecord(this.cooldownFile, CooldownSchema);
  }

  public getPosting(id: string): Promise<null | Posting> {
    return this.postings.get(id);
  }

  public getRun(id: string): Promise<null | Run> {
    return this.runs.get(id);
  }

  public listPostings(): Promise<LedgerListing<Posting>> {
    return this.postings.list();
  }

  public listRuns(): Promise<LedgerListing<Run>> {
    return this.runs.list();
  }

  public putBudget(budget: Budget): Promise<void> {
    return this.budgets.put(budget);
  }

  public async putCooldown(cooldown: Cooldown | null): Promise<void> {
    if (cooldown === null) {
      await fs.rm(this.cooldownFile, { force: true });
    } else {
      await writeYamlRecord(this.cooldownFile, cooldown, CooldownSchema);
    }
  }

  public putPosting(posting: Posting): Promise<void> {
    return this.postings.put(posting);
  }

  public putRun(run: Run): Promise<void> {
    return this.runs.put(run);
  }
}
