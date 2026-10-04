import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { addToPool, nextFromPool, rankCandidates } from '~/scripts/job-search/discovery/pool';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { candidate, MinimalPreferences, posting } from './fixtures';

const Preferences = PreferencesSchema.parse(MinimalPreferences);

describe('rankCandidates()', () => {
  it('puts listed pay at the floor first, then no-account systems, then the newest', () => {
    const floor = Preferences.hard.compensation.floor;
    const ranked = rankCandidates(
      [
        candidate({ company: 'Unlisted', compensation: null }),
        candidate({
          applyVia: 'workday',
          company: 'Workday',
          compensation: { currency: 'USD', maximum: floor, minimum: null },
        }),
        candidate({
          company: 'Below',
          compensation: { currency: 'USD', maximum: floor - 1, minimum: null },
        }),
        candidate({
          company: 'Listed',
          compensation: { currency: 'USD', maximum: floor, minimum: null },
        }),
      ],
      Preferences,
    );
    expect(ranked.map(({ company }) => company)).toStrictEqual([
      'Listed',
      'Workday',
      'Unlisted',
      'Below',
    ]);
  });
});

describe('the run pool', () => {
  let sandbox = '';

  const context = (): SessionContext => ({
    clock: {
      now: () => new Date('2026-10-04T12:00:00.000Z'),
      random: () => 0,
      sleep: () => Promise.resolve(),
    },
    dataDirectory: sandbox,
    preferences: Preferences,
    store: new YamlLedgerStore(sandbox),
  });

  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-pool-')));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  it('holds each company and title once, however many sources surface it', async () => {
    expect.hasAssertions();
    await addToPool(context(), '2026-10-04-1', [candidate({ id: null })]);
    await expect(
      addToPool(context(), '2026-10-04-1', [
        candidate({ id: null }),
        candidate({ id: null, title: 'Staff Engineer' }),
      ]),
    ).resolves.toBe(2);
  });

  it('leaves out the candidates the ledger already records', async () => {
    expect.hasAssertions();
    await addToPool(context(), '2026-10-04-1', [
      candidate({ id: null }),
      candidate({ id: null, title: 'Staff Engineer' }),
    ]);
    await context().store.putPosting(
      posting({ company: 'Acme', fingerprint: 'acme|staff-engineer', title: 'Staff Engineer' }),
    );
    await expect(nextFromPool(context(), '2026-10-04-1', 20)).resolves.toMatchObject({
      candidates: [{ title: 'Senior Software Engineer' }],
      remaining: 0,
    });
  });
});
