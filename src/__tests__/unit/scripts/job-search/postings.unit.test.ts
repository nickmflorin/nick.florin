import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import {
  attachDescription,
  recordScore,
  reviewPosting,
  reviewQueue,
  statusForScore,
} from '~/scripts/job-search/postings';
import { type PostingScore, PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { MinimalPreferences, posting } from './fixtures';

let sandbox = '';

const scratch = (): string => path.join(sandbox, 'scratch');

const context = (): SessionContext => ({
  clock: {
    now: () => new Date('2026-10-04T12:00:00.000Z'),
    random: () => 0,
    sleep: () => Promise.resolve(),
  },
  dataDirectory: path.join(sandbox, 'data'),
  preferences: PreferencesSchema.parse(MinimalPreferences),
  store: new YamlLedgerStore(path.join(sandbox, 'data')),
});

const score = (overrides: Partial<PostingScore> = {}): PostingScore => ({
  dealbreakers: [],
  dimensions: { company: 70, domain: 70, notes: 70, seniority: 80, stack: 85 },
  flags: [],
  gaps: [],
  rationale: 'A strong match on stack and level.',
  total: 78,
  ...overrides,
});

describe('statusForScore()', () => {
  const { scoring } = PreferencesSchema.parse(MinimalPreferences);

  it.each([
    [70, 'queued'],
    [69, 'maybe'],
    [50, 'maybe'],
    [49, 'dropped'],
  ])('puts a total of %s in %s', (total, status) => {
    expect(statusForScore(score({ total }), scoring)).toBe(status);
  });

  it('drops a posting with a dealbreaker, whatever its total', () => {
    expect(statusForScore(score({ dealbreakers: ['Onsite in Austin'], total: 95 }), scoring)).toBe(
      'dropped',
    );
  });
});

describe('posting operations', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-postings-')));
    await fs.mkdir(scratch());
    await context().store.putPosting(posting({ id: '4012345678', status: 'pending' }));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('attachDescription()', () => {
    it('moves the saved text into the posting and deletes the saved file', async () => {
      expect.hasAssertions();
      const file = path.join(scratch(), '4012345678.json');
      await fs.writeFile(file, JSON.stringify({ id: '4012345678', text: ' About the job… ' }));
      await expect(attachDescription(context(), file, scratch())).resolves.toMatchObject({
        description: 'About the job…',
      });
      await expect(fs.stat(file)).rejects.toThrow('ENOENT');
    });

    it('refuses a file outside the scratch directory, leaving it in place', async () => {
      expect.hasAssertions();
      const file = path.join(sandbox, 'elsewhere.json');
      await fs.writeFile(file, JSON.stringify({ id: '4012345678', text: 'About the job' }));
      await expect(attachDescription(context(), file, scratch())).rejects.toThrow('must lie in');
      await expect(fs.stat(file)).resolves.toBeDefined();
    });

    it('refuses a saved posting the ledger does not hold', async () => {
      expect.hasAssertions();
      const file = path.join(scratch(), '4099999999.json');
      await fs.writeFile(file, JSON.stringify({ id: '4099999999', text: 'About the job' }));
      await expect(attachDescription(context(), file, scratch())).rejects.toThrow(
        "There is no posting '4099999999'",
      );
    });
  });

  describe('recordScore()', () => {
    it('records the score and queues the posting by the thresholds', async () => {
      expect.hasAssertions();
      await expect(recordScore(context(), '4012345678', score())).resolves.toMatchObject({
        score: { total: 78 },
        status: 'queued',
      });
    });

    it('approves a queued posting without review when the settings say so', async () => {
      expect.hasAssertions();
      const autoApproving: SessionContext = {
        ...context(),
        preferences: PreferencesSchema.parse({
          ...MinimalPreferences,
          applying: { autoApprove: 'queued' },
        }),
      };
      await expect(recordScore(autoApproving, '4012345678', score())).resolves.toMatchObject({
        review: { decision: 'approved', reason: 'auto: score 78 ≥ 70' },
        status: 'queued',
      });
    });

    it('leaves a maybe posting for review when only queued postings are approved', async () => {
      expect.hasAssertions();
      const autoApproving: SessionContext = {
        ...context(),
        preferences: PreferencesSchema.parse({
          ...MinimalPreferences,
          applying: { autoApprove: 'queued' },
        }),
      };
      await expect(
        recordScore(autoApproving, '4012345678', score({ total: 60 })),
      ).resolves.toMatchObject({ review: { decision: null }, status: 'maybe' });
    });

    it('refuses an invalid score', async () => {
      expect.hasAssertions();
      await expect(
        recordScore(context(), '4012345678', { ...score(), total: 140 }),
      ).rejects.toThrow('is invalid');
    });

    it('refuses to score a posting that is not pending', async () => {
      expect.hasAssertions();
      await recordScore(context(), '4012345678', score());
      await expect(recordScore(context(), '4012345678', score())).rejects.toThrow(
        'not pending its score',
      );
    });
  });

  describe('reviewPosting() and reviewQueue()', () => {
    it('lists queued postings highest score first, and removes them once reviewed', async () => {
      expect.hasAssertions();
      await context().store.putPosting(posting({ id: '4012345679', status: 'pending' }));
      await recordScore(context(), '4012345678', score({ total: 72 }));
      await recordScore(context(), '4012345679', score({ total: 91 }));
      expect((await reviewQueue(context())).map(({ id }) => id)).toStrictEqual([
        '4012345679',
        '4012345678',
      ]);
      await reviewPosting(context(), '4012345679', { decision: 'approved', reason: null });
      await reviewPosting(context(), '4012345678', {
        decision: 'skipped',
        reason: 'too backend',
      });
      await expect(reviewQueue(context())).resolves.toStrictEqual([]);
      await expect(context().store.getPosting('4012345678')).resolves.toMatchObject({
        review: { decision: 'skipped', reason: 'too backend' },
        status: 'skipped',
      });
    });

    it('refuses to review a posting that is not awaiting review', async () => {
      expect.hasAssertions();
      await expect(
        reviewPosting(context(), '4012345678', { decision: 'approved', reason: null }),
      ).rejects.toThrow('not awaiting review');
    });
  });
});
