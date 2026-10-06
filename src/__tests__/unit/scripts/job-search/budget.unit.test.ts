import {
  type BudgetState,
  challengeCooldown,
  decideBudget,
  decideRunStart,
  emptyBudget,
} from '~/scripts/job-search/budget/budget';
import { PreferencesSchema } from '~/scripts/job-search/schemas';

import { MinimalPreferences } from './fixtures';

const Now = new Date('2026-10-03T12:00:00.000Z');

const { limits } = PreferencesSchema.parse(MinimalPreferences);

const State: BudgetState = { budget: emptyBudget('2026-10-03'), cooldown: null, limits, now: Now };

const ActiveCooldown = {
  reason: 'A CAPTCHA was presented.',
  startedAt: '2026-10-03T00:00:00.000Z',
  until: '2026-10-05T00:00:00.000Z',
};

describe('decideBudget()', () => {
  it('grants the first page view of the day without a wait', () => {
    expect(decideBudget(State, 'page-view', 0.5)).toStrictEqual({
      budget: { ...State.budget, lastPageViewAt: Now.toISOString(), pageViews: 1 },
      remaining: 119,
      status: 'granted',
      waitMs: 0,
    });
  });

  it('spaces a page view from the previous one by a delay drawn from the configured range', () => {
    const decision = decideBudget(
      { ...State, budget: { ...State.budget, lastPageViewAt: '2026-10-03T11:59:56.000Z' } },
      'page-view',
      0.5,
    );
    expect(decision).toMatchObject({ status: 'granted', waitMs: 6000 });
    expect(decision).toHaveProperty('budget.lastPageViewAt', '2026-10-03T12:00:06.000Z');
  });

  it('refuses a page view once the day is spent', () => {
    expect(
      decideBudget({ ...State, budget: { ...State.budget, pageViews: 120 } }, 'page-view', 0),
    ).toStrictEqual({ reason: 'The 120 page views for today are spent.', status: 'refused' });
  });

  it('refuses an Easy Apply fill once the day is spent', () => {
    expect(
      decideBudget(
        { ...State, budget: { ...State.budget, easyApplyFills: 15 } },
        'easy-apply-fill',
        0,
      ),
    ).toStrictEqual({ reason: 'The 15 fills for today are spent.', status: 'refused' });
  });

  it('refuses every kind of activity during a cooldown', () => {
    expect(
      decideBudget({ ...State, cooldown: ActiveCooldown }, 'easy-apply-fill', 0),
    ).toStrictEqual({
      reason:
        'LinkedIn activity is suspended until 2026-10-05T00:00:00.000Z: A CAPTCHA was presented.',
      status: 'refused',
    });
  });

  it('grants activity once a cooldown has expired', () => {
    expect(
      decideBudget(
        { ...State, cooldown: { ...ActiveCooldown, until: '2026-10-03T11:00:00.000Z' } },
        'easy-apply-fill',
        0,
      ),
    ).toMatchObject({ remaining: 14, status: 'granted' });
  });
});

describe('decideRunStart()', () => {
  it("takes one of the day's runs", () => {
    expect(decideRunStart(State)).toMatchObject({ budget: { runs: 1 }, remaining: 1 });
  });

  it("refuses a run once the day's runs are spent", () => {
    expect(decideRunStart({ ...State, budget: { ...State.budget, runs: 2 } })).toStrictEqual({
      reason: 'The 2 runs for today are spent.',
      status: 'refused',
    });
  });
});

describe('challengeCooldown()', () => {
  it('suspends activity for the configured hours from the challenge', () => {
    expect(challengeCooldown(limits, 'A CAPTCHA was presented.', Now)).toStrictEqual({
      reason: 'A CAPTCHA was presented.',
      startedAt: '2026-10-03T12:00:00.000Z',
      until: '2026-10-05T12:00:00.000Z',
    });
  });
});
