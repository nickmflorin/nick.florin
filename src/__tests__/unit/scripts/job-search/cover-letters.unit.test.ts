import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  approveCoverLetter,
  coverLetterHtml,
  readCoverLetter,
  saveCoverLetter,
} from '~/scripts/job-search/applying/cover-letters';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { MinimalPreferences, posting } from './fixtures';

let sandbox = '';

const context = (): SessionContext => ({
  clock: {
    now: () => new Date('2026-10-04T12:00:00.000Z'),
    random: () => 0,
    sleep: () => Promise.resolve(),
  },
  dataDirectory: sandbox,
  preferences: PreferencesSchema.parse(MinimalPreferences),
  store: new YamlLedgerStore(sandbox),
});

const Draft = {
  citations: ['Led the design-system rebuild — Hooli, Staff Engineer'],
  text: 'Dear Hiring Team,\n\nI rebuilt the design system.\n\nJane Doe',
};

describe('cover letters', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-letters-')));
    await context().store.putPosting(posting({ id: '4012345678' }));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  it('saves a draft unapproved, with its citations', async () => {
    expect.hasAssertions();
    await saveCoverLetter(context(), '4012345678', Draft);
    await expect(readCoverLetter(sandbox, '4012345678')).resolves.toMatchObject({
      approvedAt: null,
      citations: Draft.citations,
    });
  });

  it('records Nick’s approval, and a later draft is unapproved again', async () => {
    expect.hasAssertions();
    await saveCoverLetter(context(), '4012345678', Draft);
    await approveCoverLetter(context(), '4012345678');
    await saveCoverLetter(context(), '4012345678', { ...Draft, text: 'Dear Hiring Team,\n\nNew.' });
    await expect(readCoverLetter(sandbox, '4012345678')).resolves.toMatchObject({
      approvedAt: null,
    });
  });

  it('refuses to approve a letter that was never drafted', async () => {
    expect.hasAssertions();
    await expect(approveCoverLetter(context(), '4012345678')).rejects.toThrow('No cover letter');
  });
});

describe('coverLetterHtml()', () => {
  const html = (): string =>
    coverLetterHtml({
      contact: 'jane@example.com',
      date: 'October 4, 2026',
      name: 'Jane Doe',
      text: 'Dear Hiring Team,\n\nI built <b>things</b> & **shipped** them.\n\nJane Doe',
    });

  it('lays each paragraph out on its own, without Markdown markers', () => {
    expect(html()).toContain('<p>I built &lt;b&gt;things&lt;/b&gt; &amp; shipped them.</p>');
  });

  it('opens with the name and contact line', () => {
    expect(html()).toContain('<h1>Jane Doe</h1>');
  });
});
