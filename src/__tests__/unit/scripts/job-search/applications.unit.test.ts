import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { parse, stringify } from 'yaml';

import { competenciesNamedIn } from '~/scripts/job-search/applying/answer-context';
import {
  markFilled,
  markSubmitted,
  renderPacket,
  saveCustomAnswer,
} from '~/scripts/job-search/applying/applications';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { approveResume } from '~/scripts/job-search/resume/approved-resume';
import { AnswersSchema, PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { MinimalPreferences, posting } from './fixtures';

let sandbox = '';

const dataDirectory = (): string => path.join(sandbox, 'data');

const context = (): SessionContext => ({
  clock: {
    now: () => new Date('2026-10-04T12:00:00.000Z'),
    random: () => 0,
    sleep: () => Promise.resolve(),
  },
  dataDirectory: dataDirectory(),
  preferences: PreferencesSchema.parse(MinimalPreferences),
  store: new YamlLedgerStore(dataDirectory()),
});

const approved = posting({
  id: '4012345678',
  review: { decision: 'approved', reason: null, reviewedAt: '2026-10-04T11:00:00.000Z' },
  status: 'queued',
});

const approveAResume = async (): Promise<void> => {
  const file = path.join(sandbox, 'Resume.pdf');
  await fs.writeFile(file, '%PDF placeholder');
  await approveResume({
    dataDirectory: dataDirectory(),
    fileName: 'Jane-Doe-Resume.pdf',
    now: new Date('2026-10-04T10:00:00.000Z'),
    resume: { file, modifiedAt: new Date(), name: 'Resume.pdf', provenance: null },
  });
};

describe('applications', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-apply-')));
    await context().store.putPosting(approved);
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('markFilled()', () => {
    it('refuses while no resume is approved', async () => {
      expect.hasAssertions();
      await expect(markFilled(context(), '4012345678')).rejects.toThrow(
        'No resume has been approved',
      );
    });

    it('records the approved resume and marks the application filled', async () => {
      expect.hasAssertions();
      await approveAResume();
      await expect(markFilled(context(), '4012345678')).resolves.toMatchObject({
        application: { submittedAt: null },
        status: 'filled',
      });
    });

    it('refuses a posting that was not approved in review', async () => {
      expect.hasAssertions();
      await approveAResume();
      await context().store.putPosting(posting({ id: '4012345679', status: 'maybe' }));
      await expect(markFilled(context(), '4012345679')).rejects.toThrow('not approved');
    });
  });

  describe('markSubmitted()', () => {
    it('records the submission of a filled application', async () => {
      expect.hasAssertions();
      await approveAResume();
      await markFilled(context(), '4012345678');
      await expect(markSubmitted(context(), '4012345678')).resolves.toMatchObject({
        application: { submittedAt: '2026-10-04T12:00:00.000Z' },
        status: 'submitted',
      });
    });

    it('refuses an application that was never filled', async () => {
      expect.hasAssertions();
      await expect(markSubmitted(context(), '4012345678')).rejects.toThrow('no filled application');
    });
  });

  describe('saveCustomAnswer()', () => {
    it('saves an answer, replacing an earlier answer to the same question', async () => {
      expect.hasAssertions();
      await fs.mkdir(dataDirectory(), { recursive: true });
      await fs.writeFile(
        path.join(dataDirectory(), 'answers.yaml'),
        stringify({
          availability: { noticePeriodWeeks: 0 },
          compensation: { target: 225000 },
          contact: {
            city: 'Springfield',
            country: 'United States',
            email: 'jane@example.com',
            phone: '+1 555-0100',
            region: 'IL',
          },
          links: { linkedin: 'https://www.linkedin.com/in/example' },
          workAuthorization: { authorizedCountries: ['US'] },
        }),
      );
      await saveCustomAnswer(context(), { answer: 'Yes', question: 'Willing to relocate?' });
      await saveCustomAnswer(context(), { answer: 'No', question: 'willing to relocate' });
      const saved = AnswersSchema.parse(
        parse(await fs.readFile(path.join(dataDirectory(), 'answers.yaml'), 'utf-8')),
      );
      expect(saved.custom.map(({ answer, question }) => ({ answer, question }))).toStrictEqual([
        { answer: 'No', question: 'willing to relocate' },
      ]);
    });
  });
});

describe('renderPacket()', () => {
  const workdayPacket = (): string =>
    renderPacket({
      answers: [
        { label: 'Email', source: 'answers', value: 'jane@example.com' },
        { label: 'Describe a project', unanswered: true },
      ],
      posting: posting({
        applyUrl: 'https://hooli.wd5.myworkdayjobs.com/careers/job/1',
        applyVia: 'workday',
      }),
      resumeFile: '/data/resume/Jane-Doe-Resume.pdf',
      years: [{ label: 'React', years: 8 }],
    });

  it('says where to apply, whether that needs an account, and which resume to attach', () => {
    expect(workdayPacket()).toContain(
      '- Apply at: https://hooli.wd5.myworkdayjobs.com/careers/job/1',
    );
    expect(workdayPacket()).toContain('- Needs an account: yes');
    expect(workdayPacket()).toContain('- Resume to attach: /data/resume/Jane-Doe-Resume.pdf');
  });

  it('lists every answer, marking the unanswered ones, and the years table', () => {
    expect(workdayPacket()).toContain('- Email: jane@example.com');
    expect(workdayPacket()).toContain('- Describe a project: _not in the data');
    expect(workdayPacket()).toContain('- React: 8');
  });
});

describe('competenciesNamedIn()', () => {
  it('lists the competencies a description names as whole words', () => {
    expect(
      competenciesNamedIn('We use React, TypeScript and Go.', [
        { label: 'React', months: 117, proficiency: null, slug: 'react', years: 8 },
        { label: 'React Native', months: 12, proficiency: null, slug: 'react-native', years: 1 },
        { label: 'Go', months: 0, proficiency: null, slug: 'go', years: 0 },
        { label: 'TypeScript', months: 72, proficiency: null, slug: 'typescript', years: 5 },
      ]),
    ).toStrictEqual([
      { label: 'React', years: 8 },
      { label: 'TypeScript', years: 5 },
    ]);
  });
});
