import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { stringify } from 'yaml';

import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';

import { posting } from './fixtures';

let sandbox = '';

const postingsDirectory = (): string => path.join(sandbox, 'ledger', 'postings');

describe('yaml ledger store', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-ledger-')));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('getPosting()', () => {
    it('returns null for a posting that was never recorded', async () => {
      expect.hasAssertions();
      await expect(new YamlLedgerStore(sandbox).getPosting('4012345678')).resolves.toBeNull();
    });

    it('reads back a posting exactly as it was recorded', async () => {
      expect.hasAssertions();
      const store = new YamlLedgerStore(sandbox);
      await store.putPosting(posting());
      await expect(store.getPosting('4012345678')).resolves.toStrictEqual(posting());
    });

    it('rejects a file that holds a posting other than the one it is named for', async () => {
      expect.hasAssertions();
      await fs.mkdir(postingsDirectory(), { recursive: true });
      await fs.writeFile(
        path.join(postingsDirectory(), '4012345678.yaml'),
        stringify(posting({ id: '4012345679' })),
      );
      await expect(new YamlLedgerStore(sandbox).getPosting('4012345678')).rejects.toThrow(
        "holds the record '4012345679'",
      );
    });

    it('refuses a key that could address a path outside the directory', async () => {
      expect.hasAssertions();
      await expect(new YamlLedgerStore(sandbox).getPosting('../preferences')).rejects.toThrow(
        'is not of the form the directory expects',
      );
    });
  });

  describe('putPosting()', () => {
    it('refuses to write a posting the schema rejects, leaving no file behind', async () => {
      expect.hasAssertions();
      const store = new YamlLedgerStore(sandbox);
      await expect(store.putPosting(posting({ title: '' }))).rejects.toThrow('is invalid');
      await expect(store.getPosting('4012345678')).resolves.toBeNull();
    });
  });

  describe('listPostings()', () => {
    it('lists nothing before the ledger exists', async () => {
      expect.hasAssertions();
      await expect(new YamlLedgerStore(sandbox).listPostings()).resolves.toStrictEqual({
        records: [],
        skipped: [],
      });
    });

    it('reports iCloud placeholders and stray files instead of reading them', async () => {
      expect.hasAssertions();
      const store = new YamlLedgerStore(sandbox);
      await store.putPosting(posting());
      await Promise.all(
        [
          '.4012345679.yaml.icloud',
          '4012345678 2.yaml',
          'notes.txt',
          '.DS_Store',
          '.4012345678.yaml.4242.tmp',
        ].map(file => fs.writeFile(path.join(postingsDirectory(), file), '')),
      );
      const { records, skipped } = await store.listPostings();
      expect(records).toStrictEqual([posting()]);
      expect(skipped.toSorted((a, b) => a.file.localeCompare(b.file))).toStrictEqual([
        { file: '.4012345679.yaml.icloud', reason: 'not-downloaded' },
        { file: '4012345678 2.yaml', reason: 'conflict-copy' },
        { file: 'notes.txt', reason: 'unrecognized' },
      ]);
    });
  });

  describe('putCooldown()', () => {
    it('records a cooldown, and clears it when given null', async () => {
      expect.hasAssertions();
      const store = new YamlLedgerStore(sandbox);
      const cooldown = {
        reason: 'A CAPTCHA was presented.',
        startedAt: '2026-10-03T14:00:00.000Z',
        until: '2026-10-05T14:00:00.000Z',
      };
      await store.putCooldown(cooldown);
      await expect(store.getCooldown()).resolves.toStrictEqual(cooldown);
      await store.putCooldown(null);
      await expect(store.getCooldown()).resolves.toBeNull();
    });
  });

  describe('putBudget()', () => {
    it('keys the day of activity by its date', async () => {
      expect.hasAssertions();
      const store = new YamlLedgerStore(sandbox);
      const budget = { date: '2026-10-03', easyApplyFills: 2, pageViews: 41, runs: 1 };
      await store.putBudget(budget);
      await expect(store.getBudget('2026-10-03')).resolves.toStrictEqual(budget);
    });
  });
});
