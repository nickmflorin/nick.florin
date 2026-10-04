import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import {
  type Clock,
  finishRun,
  type SessionContext,
  startRun,
  takeBudget,
  triageBatch,
} from '~/scripts/job-search/session';

import { candidate, MinimalPreferences } from './fixtures';

let sandbox = '';

const sleeps: number[] = [];

/**
 * A clock fixed at a moment in the local afternoon of 2026-10-03, so that the local date the ledger
 * keys days by is the same in every time zone the suite might run in.
 */
const FixedClock: Clock = {
  now: () => new Date(2026, 9, 3, 15, 0, 0),
  random: () => 0,
  sleep: milliseconds => {
    sleeps.push(milliseconds);
    return Promise.resolve();
  },
};

const sessionContext = (): SessionContext => ({
  clock: FixedClock,
  dataDirectory: sandbox,
  preferences: PreferencesSchema.parse(MinimalPreferences),
  store: new YamlLedgerStore(sandbox),
});

describe('job-search session', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-session-')));
    sleeps.length = 0;
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('startRun()', () => {
    it('numbers the runs of a day in order and takes one run each', async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await expect(startRun(context, [])).resolves.toMatchObject({ run: { id: '2026-10-03-1' } });
      await expect(startRun(context, ['Onsite in Boston is fine'])).resolves.toMatchObject({
        run: { id: '2026-10-03-2', overrides: ['Onsite in Boston is fine'] },
        status: 'started',
      });
      await expect(context.store.getBudget('2026-10-03')).resolves.toMatchObject({ runs: 2 });
    });

    it("refuses a run once the day's runs are spent", async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await startRun(context, []);
      await startRun(context, []);
      await expect(startRun(context, [])).resolves.toStrictEqual({
        reason: 'The 2 runs for today are spent.',
        status: 'refused',
      });
    });
  });

  describe('finishRun()', () => {
    it('starts a cooldown when a run ends on a challenge, refusing all activity', async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await startRun(context, []);
      await finishRun(context, '2026-10-03-1', 'challenge', 'A CAPTCHA was presented.');
      await expect(context.store.getCooldown()).resolves.toMatchObject({
        reason: 'A CAPTCHA was presented.',
      });
      await expect(takeBudget(context, 'page-view')).resolves.toMatchObject({ status: 'refused' });
      await expect(startRun(context, [])).resolves.toMatchObject({ status: 'refused' });
    });

    it('refuses to finish a run twice', async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await startRun(context, []);
      await finishRun(context, '2026-10-03-1', 'completed', null);
      await expect(finishRun(context, '2026-10-03-1', 'completed', null)).rejects.toThrow(
        "The run '2026-10-03-1' already finished",
      );
    });
  });

  describe('takeBudget()', () => {
    it('waits out the page-load delay before granting the next page view', async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await takeBudget(context, 'page-view');
      await expect(takeBudget(context, 'page-view')).resolves.toMatchObject({
        remaining: 118,
        status: 'granted',
        waitMs: 5000,
      });
      expect(sleeps).toStrictEqual([0, 5000]);
    });
  });

  describe('triageBatch()', () => {
    it('records the decided postings and dedupes a later batch against them', async () => {
      expect.hasAssertions();
      const context = sessionContext();
      await startRun(context, []);
      const first = await triageBatch(context, '2026-10-03-1', 'detail', [candidate()]);
      expect(first.survivors).toHaveLength(1);
      await expect(context.store.getPosting('4012345678')).resolves.toMatchObject({
        status: 'pending',
      });
      const second = await triageBatch(context, '2026-10-03-1', 'card', [candidate()]);
      expect(second.duplicates).toStrictEqual([{ duplicateOf: '4012345678', id: '4012345678' }]);
    });

    it('refuses a batch for a run that is not open', async () => {
      expect.hasAssertions();
      await expect(
        triageBatch(sessionContext(), '2026-10-03-9', 'card', [candidate()]),
      ).rejects.toThrow("There is no run '2026-10-03-9' in the ledger.");
    });
  });
});
