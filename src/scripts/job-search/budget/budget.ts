import { type Budget, type Cooldown, type Preferences } from '../schemas';

type Limits = Preferences['limits'];

const MillisecondsPerSecond = 1000;

const MillisecondsPerHour = 60 * 60 * MillisecondsPerSecond;

/**
 * The kinds of LinkedIn activity that draw on the daily budget, one unit per call.
 */
export const BudgetKinds = ['easy-apply-fill', 'page-view'] as const;

export type BudgetKind = (typeof BudgetKinds)[number];

export type BudgetDecision =
  | {
      readonly budget: Budget;
      readonly remaining: number;
      readonly status: 'granted';
      /**
       * How long the caller must wait before the activity may happen, so that consecutive page
       * loads are spaced by the configured delay.
       */
      readonly waitMs: number;
    }
  | { readonly reason: string; readonly status: 'refused' };

export interface BudgetState {
  readonly budget: Budget;
  readonly cooldown: Cooldown | null;
  readonly limits: Limits;
  readonly now: Date;
}

export const emptyBudget = (date: string): Budget => ({
  date,
  easyApplyFills: 0,
  lastPageViewAt: null,
  pageViews: 0,
  runs: 0,
});

/**
 * Whether a recorded cooldown still suspends LinkedIn activity at the given time.
 */
export const isCoolingDown = (cooldown: Cooldown | null, now: Date): cooldown is Cooldown =>
  cooldown !== null && new Date(cooldown.until).getTime() > now.getTime();

const cooldownRefusal = (cooldown: Cooldown): BudgetDecision => ({
  reason: `LinkedIn activity is suspended until ${cooldown.until}: ${cooldown.reason}`,
  status: 'refused',
});

/**
 * Picks a pause, in milliseconds, uniformly within a configured range of seconds, from a random
 * number in `[0, 1)`: the pause before a page load, or between the steps of an application form.
 */
export const delayWithinMs = (
  [minimum, maximum]: readonly [number, number],
  random: number,
): number => (minimum + (maximum - minimum) * random) * MillisecondsPerSecond;

const grantPageView = ({ budget, limits, now }: BudgetState, random: number): BudgetDecision => {
  const sinceLast =
    budget.lastPageViewAt === null
      ? Infinity
      : now.getTime() - new Date(budget.lastPageViewAt).getTime();
  const waitMs = Math.max(0, Math.ceil(delayWithinMs(limits.delaySeconds, random) - sinceLast));
  return {
    budget: {
      ...budget,
      lastPageViewAt: new Date(now.getTime() + waitMs).toISOString(),
      pageViews: budget.pageViews + 1,
    },
    remaining: limits.linkedinPageViewsPerDay - budget.pageViews - 1,
    status: 'granted',
    waitMs,
  };
};

const grantEasyApplyFill = ({ budget, limits }: BudgetState): BudgetDecision => ({
  budget: { ...budget, easyApplyFills: budget.easyApplyFills + 1 },
  remaining: limits.easyApplyFillsPerDay - budget.easyApplyFills - 1,
  status: 'granted',
  waitMs: 0,
});

/**
 * Decides whether one unit of LinkedIn activity may be taken from the day's budget.
 *
 * @param {BudgetState} state The day's activity so far, any cooldown, the limits, and the time.
 * @param {BudgetKind} kind The kind of activity requested.
 * @param {number} random
 *   A random number in `[0, 1)` that places the page-load delay within its configured range.
 *
 * @returns {BudgetDecision}
 *   The refusal and its reason, or the grant: the budget with the unit taken, what remains, and how
 *   long to wait before acting.
 */
export const decideBudget = (
  state: BudgetState,
  kind: BudgetKind,
  random: number,
): BudgetDecision => {
  const { budget, cooldown, limits, now } = state;
  if (isCoolingDown(cooldown, now)) {
    return cooldownRefusal(cooldown);
  }
  switch (kind) {
    case 'easy-apply-fill':
      return budget.easyApplyFills >= limits.easyApplyFillsPerDay
        ? {
            reason: `The ${limits.easyApplyFillsPerDay} fills for today are spent.`,
            status: 'refused',
          }
        : grantEasyApplyFill(state);
    case 'page-view':
      return budget.pageViews >= limits.linkedinPageViewsPerDay
        ? {
            reason: `The ${limits.linkedinPageViewsPerDay} page views for today are spent.`,
            status: 'refused',
          }
        : grantPageView(state, random);
  }
};

/**
 * Decides whether a new run may start, which takes one of the day's runs.
 *
 * @param {BudgetState} state The day's activity so far, any cooldown, the limits, and the time.
 *
 * @returns {BudgetDecision} The refusal and its reason, or the budget with the run taken.
 */
export const decideRunStart = (state: BudgetState): BudgetDecision => {
  const { budget, cooldown, limits, now } = state;
  if (isCoolingDown(cooldown, now)) {
    return cooldownRefusal(cooldown);
  } else if (budget.runs >= limits.runsPerDay) {
    return { reason: `The ${limits.runsPerDay} runs for today are spent.`, status: 'refused' };
  }
  return {
    budget: { ...budget, runs: budget.runs + 1 },
    remaining: limits.runsPerDay - budget.runs - 1,
    status: 'granted',
    waitMs: 0,
  };
};

/**
 * Builds the cooldown that a security challenge starts: LinkedIn activity is suspended for the
 * configured number of hours from the moment the challenge was met.
 */
export const challengeCooldown = (limits: Limits, reason: string, now: Date): Cooldown => ({
  reason,
  startedAt: now.toISOString(),
  until: new Date(
    now.getTime() + limits.cooldownHoursAfterChallenge * MillisecondsPerHour,
  ).toISOString(),
});
