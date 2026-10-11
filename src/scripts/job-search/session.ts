import { setTimeout as sleep } from 'node:timers/promises';

import {
  type BudgetDecision,
  type BudgetKind,
  challengeCooldown,
  decideBudget,
  decideRunStart,
  emptyBudget,
} from './budget/budget';
import { withLedgerLock } from './budget/lock';
import { localDateKey, nextRunId } from './ledger/keys';
import { type LedgerStore, type SkippedLedgerFile } from './ledger/ledger-store';
import {
  type Candidate,
  type Preferences,
  type Run,
  type RunEnding,
  type TriageStage,
} from './schemas';
import { triageCandidates, type TriageResult } from './triage/triage';

/**
 * The sources of time and chance that the job-search session depends on, injected so that the
 * pacing and the daily boundaries can be exercised deterministically.
 */
export interface Clock {
  readonly now: () => Date;
  /**
   * Returns a random number in `[0, 1)`.
   */
  readonly random: () => number;
  readonly sleep: (milliseconds: number) => Promise<void>;
}

export const SystemClock: Clock = {
  now: () => new Date(),
  random: () => Math.random(),
  sleep: async milliseconds => {
    await sleep(milliseconds);
  },
};

export interface SessionContext {
  readonly clock: Clock;
  readonly dataDirectory: string;
  readonly preferences: Preferences;
  readonly store: LedgerStore;
}

export type RunStartResult =
  | { readonly reason: string; readonly status: 'refused' }
  | { readonly run: Run; readonly status: 'started' };

const readDay = async ({ clock, store }: SessionContext) => {
  const now = clock.now();
  const date = localDateKey(now);
  const [budget, cooldown] = await Promise.all([store.getBudget(date), store.getCooldown()]);
  return { budget: budget ?? emptyBudget(date), cooldown, now };
};

const requireRun = async ({ store }: SessionContext, runId: string): Promise<Run> => {
  const run = await store.getRun(runId);
  if (run === null) {
    throw new Error(`There is no run '${runId}' in the ledger.`);
  }
  return run;
};

const requireOpenRun = async (context: SessionContext, runId: string): Promise<Run> => {
  const run = await requireRun(context, runId);
  if (run.finishedAt !== null) {
    throw new Error(`The run '${runId}' already finished at ${run.finishedAt}.`);
  }
  return run;
};

/**
 * The endings after which a run accepts no more work: LinkedIn showed a security step or signed the
 * browser out, so the run's remaining activity must stop and wait for a new run.
 */
const StoppedEndings = ['challenge', 'logged-out'] as const satisfies readonly RunEnding[];

/**
 * Requires a run that can still be triaged into: one that is open, or that finished without being
 * stopped. Triage reads no LinkedIn page and takes no budget, so a late fix to a finished run's
 * candidates does not need a new run, which the daily run limit would make costly.
 */
const requireTriageableRun = async (context: SessionContext, runId: string): Promise<Run> => {
  const run = await requireRun(context, runId);
  const stoppedBy = StoppedEndings.find(ending => ending === run.endedBy);
  if (stoppedBy !== undefined) {
    throw new Error(
      `The run '${runId}' ended on '${stoppedBy}' at ${run.finishedAt}, so it accepts no more ` +
        'candidates: start a new run once the cooldown, or the sign-in, allows it.',
    );
  }
  return run;
};

/**
 * Takes one unit of LinkedIn activity from the day's budget, waiting out the page-load delay before
 * returning when one is due.
 *
 * The wait happens while the ledger lock is held, so that concurrent callers queue behind it and
 * consecutive page loads stay spaced by the configured delay however many callers there are.
 *
 * @param {SessionContext} context The ledger, the preferences, and the clock.
 * @param {BudgetKind} kind The kind of activity requested.
 *
 * @returns {Promise<BudgetDecision>} The grant, or the refusal and its reason.
 */
export const takeBudget = (context: SessionContext, kind: BudgetKind): Promise<BudgetDecision> =>
  withLedgerLock(context.dataDirectory, async () => {
    const decision = decideBudget(
      { ...(await readDay(context)), limits: context.preferences.limits },
      kind,
      context.clock.random(),
    );
    if (decision.status === 'granted') {
      await context.store.putBudget(decision.budget);
      await context.clock.sleep(decision.waitMs);
    }
    return decision;
  });

/**
 * Starts a run: takes one of the day's runs and records the run, with the run-only adjustments to
 * the saved preferences that it was started with.
 *
 * @param {SessionContext} context The ledger, the preferences, and the clock.
 * @param {readonly string[]} overrides The run-only adjustments, as given.
 *
 * @returns {Promise<RunStartResult>} The started run, or the refusal and its reason.
 */
export const startRun = (
  context: SessionContext,
  overrides: readonly string[],
): Promise<RunStartResult> =>
  withLedgerLock(context.dataDirectory, async () => {
    const day = await readDay(context);
    const decision = decideRunStart({ ...day, limits: context.preferences.limits });
    if (decision.status === 'refused') {
      return decision;
    }
    const { records } = await context.store.listRuns();
    const run: Run = {
      endedBy: null,
      finishedAt: null,
      id: nextRunId(
        records.map(({ id }) => id),
        day.now,
      ),
      overrides: [...overrides],
      recommendations: { found: 0, queued: 0 },
      searches: [],
      startedAt: day.now.toISOString(),
    };
    await context.store.putRun(run);
    await context.store.putBudget(decision.budget);
    return { run, status: 'started' };
  });

/**
 * Finishes a run, recording why it ended. A run that ended on a security challenge also starts the
 * cooldown that suspends LinkedIn activity.
 *
 * @param {SessionContext} context The ledger, the preferences, and the clock.
 * @param {string} runId The run to finish.
 * @param {RunEnding} endedBy Why the run ended.
 * @param {null | string} reason What happened, recorded on the cooldown a challenge starts.
 *
 * @throws {Error} If the run does not exist or has already finished.
 *
 * @returns {Promise<Run>} The finished run.
 */
export const finishRun = (
  context: SessionContext,
  runId: string,
  endedBy: RunEnding,
  reason: null | string,
): Promise<Run> =>
  withLedgerLock(context.dataDirectory, async () => {
    const run = await requireOpenRun(context, runId);
    const now = context.clock.now();
    const finished: Run = { ...run, endedBy, finishedAt: now.toISOString() };
    await context.store.putRun(finished);
    if (endedBy === 'challenge') {
      await context.store.putCooldown(
        challengeCooldown(
          context.preferences.limits,
          reason ?? 'A security challenge was presented.',
          now,
        ),
      );
    }
    return finished;
  });

export interface TriageBatchResult extends Omit<TriageResult, 'records'> {
  /**
   * The ledger's posting files that could not be read, such as iCloud placeholders. Deduplication
   * could not consider the postings they hold, so a non-empty list is worth surfacing.
   */
  readonly unreadable: SkippedLedgerFile[];
}

/**
 * Triages a batch of candidates read in one browser pass of an open run, and records the postings
 * the triage decided on.
 *
 * @param {SessionContext} context The ledger, the preferences, and the clock.
 * @param {string} runId The open run the candidates were read in.
 * @param {TriageStage} stage The pass the candidates were read at.
 * @param {readonly Candidate[]} candidates The candidates, as the browser pass read them.
 *
 * @throws {Error}
 *   If the run does not exist, or ended on a challenge or a logout. A run that finished otherwise
 *   still accepts candidates.
 *
 * @returns {Promise<TriageBatchResult>} The outcome for every candidate.
 */
export const triageBatch = (
  context: SessionContext,
  runId: string,
  stage: TriageStage,
  candidates: readonly Candidate[],
): Promise<TriageBatchResult> =>
  withLedgerLock(context.dataDirectory, async () => {
    await requireTriageableRun(context, runId);
    const { records: recorded, skipped } = await context.store.listPostings();
    const { records, ...result } = triageCandidates({
      candidates,
      now: context.clock.now(),
      preferences: context.preferences,
      recorded,
      runId,
      stage,
    });
    await Promise.all(records.map(posting => context.store.putPosting(posting)));
    return { ...result, unreadable: skipped };
  });
