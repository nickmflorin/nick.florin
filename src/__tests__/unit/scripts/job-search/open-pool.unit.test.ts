import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { z } from 'zod';

import { type ResultCard } from '~/scripts/job-search/discovery/cards';
import { openPoolMatches } from '~/scripts/job-search/discovery/open-pool';
import {
  CardReadAttempts,
  type PageDriver,
  pageProblemOf,
  readPageCards,
} from '~/scripts/job-search/discovery/page-driver';
import { PageScripts } from '~/scripts/job-search/discovery/page-scripts';
import { addToPool } from '~/scripts/job-search/discovery/pool';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext, startRun } from '~/scripts/job-search/session';

import { candidate, MinimalPreferences } from './fixtures';

const RunId = '2026-10-03-1';

const SearchUrl = 'https://www.linkedin.com/jobs/search/?keywords=engineer';

const cardOf = (company: string, id: null | string = null): ResultCard => ({
  id,
  lines: [
    'Senior Software Engineer',
    'Senior Software Engineer',
    company,
    'United States (Remote)',
    'Easy Apply',
  ],
  title: 'Senior Software Engineer',
});

interface FakePageOptions {
  readonly cards: readonly ResultCard[];
  /**
   * The job identifier each clicked company's card opens.
   */
  readonly opens: Readonly<Record<string, string | undefined>>;
  /**
   * Whether a click leaves the page showing the posting it showed before, as LinkedIn's
   * recommendations do.
   */
  readonly staleClicks?: boolean;
  readonly texts: Readonly<Record<string, string>>;
}

const fakePage = ({ cards, opens, staleClicks = false, texts }: FakePageOptions) => {
  let current: null | string = null;
  const navigated: string[] = [];
  const driver: PageDriver = {
    navigate: url => {
      navigated.push(url);
      current = /view\/(\d+)/.exec(url)?.at(1) ?? null;
      return Promise.resolve();
    },
    run: script => {
      if (script === PageScripts['result-cards']) {
        return Promise.resolve({ cards, filters: [], location: null, url: SearchUrl });
      } else if (script === PageScripts['job-detail']) {
        return Promise.resolve({
          applyUrl: null,
          closed: false,
          easyApply: true,
          id: current,
          text: texts[current ?? ''] ?? '',
          url: `https://www.linkedin.com/jobs/view/${current}/`,
        });
      }
      const wanted = /const want = (\{.*?\});/.exec(script)?.at(1) ?? '{}';
      const want: unknown = JSON.parse(wanted);
      const id = opens[z.object({ company: z.string() }).parse(want).company];
      if (id === undefined) {
        return Promise.resolve({ found: false, url: SearchUrl });
      }
      current = staleClicks ? current : id;
      return Promise.resolve({ found: true, id: current ?? id, loaded: true, url: SearchUrl });
    },
  };
  return { driver, navigated };
};

describe('opening the pool', () => {
  let sandbox = '';

  const context = (): SessionContext => ({
    clock: {
      now: () => new Date(2026, 9, 3, 15, 0, 0),
      random: () => 0,
      sleep: () => Promise.resolve(),
    },
    dataDirectory: sandbox,
    preferences: PreferencesSchema.parse(MinimalPreferences),
    store: new YamlLedgerStore(sandbox),
  });

  const poolOf = async (...companies: string[]): Promise<void> => {
    await startRun(context(), []);
    await addToPool(
      context(),
      RunId,
      companies.map(company => candidate({ company, id: null })),
    );
  };

  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-open-')));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  it('opens the pooled postings the page shows, and records them with their text', async () => {
    expect.hasAssertions();
    await poolOf('Hooli', 'Pied Piper', 'Aviato');
    const { driver } = fakePage({
      cards: [cardOf('Pied Piper'), cardOf('Hooli')],
      opens: { Hooli: '4012345678', 'Pied Piper': '4012345679' },
      texts: { '4012345678': 'Hooli text\n51-200 employees', '4012345679': 'Pied Piper text' },
    });
    const result = await openPoolMatches(context(), driver, RunId, 10);
    expect(result).toMatchObject({ matched: 2, onPage: 2, status: 'opened', unopened: 3 });
    await expect(context().store.getPosting('4012345678')).resolves.toMatchObject({
      description: 'Hooli text\n51-200 employees',
      status: 'pending',
    });
    await expect(context().store.getPosting('4012345679')).resolves.toMatchObject({
      description: 'Pied Piper text',
    });
    await expect(context().store.getBudget('2026-10-03')).resolves.toMatchObject({ pageViews: 2 });
  });

  it('opens a card with a known identifier by loading the posting, not clicking it', async () => {
    expect.hasAssertions();
    await poolOf('Hooli');
    const { driver, navigated } = fakePage({
      cards: [cardOf('Hooli', '4012345678')],
      opens: {},
      texts: { '4012345678': 'Hooli text' },
    });
    await openPoolMatches(context(), driver, RunId, 10);
    expect(navigated).toStrictEqual(['https://www.linkedin.com/jobs/view/4012345678/']);
    await expect(context().store.getPosting('4012345678')).resolves.toMatchObject({
      description: 'Hooli text',
    });
  });

  it('never saves a text when a click leaves the page without the target posting', async () => {
    expect.hasAssertions();
    await poolOf('Hooli', 'Pied Piper');
    const { driver } = fakePage({
      cards: [cardOf('Hooli'), cardOf('Pied Piper')],
      opens: { Hooli: '4012345678', 'Pied Piper': '4012345679' },
      staleClicks: true,
      texts: { '4012345678': 'Hooli text', '4012345679': 'Pied Piper text' },
    });
    const result = await openPoolMatches(context(), driver, RunId, 10);
    expect(result).toMatchObject({
      attempts: [{ outcome: 'not-loaded' }, { outcome: 'not-loaded' }],
    });
    await expect(context().store.getPosting('4012345679')).resolves.toBeNull();
  });

  it('refuses a second card that opens the posting the first one did', async () => {
    expect.hasAssertions();
    await poolOf('Hooli', 'Pied Piper');
    const { driver } = fakePage({
      cards: [cardOf('Hooli'), cardOf('Pied Piper')],
      opens: { Hooli: '4012345678', 'Pied Piper': '4012345678' },
      texts: { '4012345678': 'Hooli text' },
    });
    const result = await openPoolMatches(context(), driver, RunId, 10);
    expect(result).toMatchObject({
      attempts: [{ outcome: 'opened' }, { outcome: 'id-mismatch' }],
    });
    await expect(context().store.getPosting('4012345678')).resolves.toMatchObject({
      description: 'Hooli text',
    });
  });

  it('stops at a security step without opening anything', async () => {
    expect.hasAssertions();
    await poolOf('Hooli');
    const driver: PageDriver = {
      navigate: () => Promise.resolve(),
      run: () =>
        Promise.resolve({
          cards: [],
          filters: [],
          location: null,
          url: 'https://www.linkedin.com/checkpoint/challenge/abc',
        }),
    };
    await expect(openPoolMatches(context(), driver, RunId, 10)).resolves.toMatchObject({
      status: 'refused',
    });
  });
});

describe('readPageCards()', () => {
  const reading = (cards: readonly ResultCard[]) => ({
    cards,
    filters: [],
    location: null,
    url: SearchUrl,
  });

  it('reads again while the page shows no cards yet', async () => {
    expect.hasAssertions();
    const readings = [reading([]), reading([]), reading([cardOf('Hooli')])];
    const sleeps: number[] = [];
    const driver: PageDriver = {
      navigate: () => Promise.resolve(),
      run: () => Promise.resolve(readings.shift()),
    };
    const result = await readPageCards(driver, milliseconds => {
      sleeps.push(milliseconds);
      return Promise.resolve();
    });
    expect(result.cards).toHaveLength(1);
    expect(sleeps).toHaveLength(2);
  });

  it('gives up after the attempts and returns the empty reading', async () => {
    expect.hasAssertions();
    let reads = 0;
    const driver: PageDriver = {
      navigate: () => Promise.resolve(),
      run: () => {
        reads += 1;
        return Promise.resolve(reading([]));
      },
    };
    const result = await readPageCards(driver, () => Promise.resolve());
    expect(result.cards).toHaveLength(0);
    expect(reads).toBe(CardReadAttempts);
  });
});

describe('pageProblemOf()', () => {
  it.each([
    ['https://www.linkedin.com/checkpoint/challenge/abc', 'challenge'],
    ['https://www.linkedin.com/authwall?trk=x', 'challenge'],
    ['https://www.linkedin.com/login', 'logged-out'],
    [SearchUrl, null],
  ])('classifies %s', (url, expected) => {
    expect(pageProblemOf(url)).toBe(expected);
  });
});
