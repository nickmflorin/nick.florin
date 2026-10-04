import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { markFilled, markSubmitted } from '~/scripts/job-search/applying/applications';
import {
  checkReading,
  readDraft,
  recordPlan,
  startApplication,
} from '~/scripts/job-search/applying/drafts';
import { type FillPlan } from '~/scripts/job-search/applying/fill-plan';
import { type FormReading, type ReadField } from '~/scripts/job-search/applying/form-scripts';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { approveResume } from '~/scripts/job-search/resume/approved-resume';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { MinimalPreferences, posting } from './fixtures';

let sandbox = '';

const dataDirectory = (): string => path.join(sandbox, 'data');

const temporaryDirectory = (): string => path.join(sandbox, 'tmp');

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

const Id = '4012345678';

const ResumeFileName = 'Jane-Doe-Resume.pdf';

const approveAResume = async (): Promise<void> => {
  const file = path.join(sandbox, 'Resume.pdf');
  await fs.writeFile(file, '%PDF placeholder');
  await approveResume({
    dataDirectory: dataDirectory(),
    fileName: ResumeFileName,
    now: new Date('2026-10-04T10:00:00.000Z'),
    resume: { file, modifiedAt: new Date(), name: 'Resume.pdf', provenance: null },
  });
};

const start = () =>
  startApplication(context(), Id, {
    accountApproved: false,
    temporaryDirectory: temporaryDirectory(),
  });

const field = (overrides: Partial<ReadField> & Pick<ReadField, 'key' | 'label'>): ReadField => ({
  options: [],
  required: true,
  type: 'text',
  value: null,
  widget: 'native',
  ...overrides,
});

const reading = (fields: ReadField[]): FormReading => ({
  buttons: [],
  challenge: false,
  fields,
  progress: null,
  text: '',
  unsupported: [],
  url: 'https://boards.example.com/apply',
});

const Plan: FillPlan = {
  fills: [{ key: 'f0', label: 'Email', type: 'text', value: 'jane@example.com', widget: 'native' }],
  interactive: [
    {
      key: 'f1',
      label: 'Location (City)',
      type: 'text',
      value: 'Springfield, IL',
      widget: 'typeahead',
    },
  ],
  kept: [],
  needsOptions: [],
  unanswered: [],
  uploads: [{ file: '/staged/Jane-Doe-Resume.pdf', key: 'f2', label: 'Resume/CV' }],
};

const filledReading = reading([
  field({ key: 'f0', label: 'Email', value: 'jane@example.com' }),
  field({
    key: 'f1',
    label: 'Location (City)',
    value: 'Springfield, Illinois, United States',
    widget: 'typeahead',
  }),
  field({ key: 'f2', label: 'Resume/CV', type: 'file', value: [ResumeFileName], widget: 'file' }),
]);

describe('application drafts', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-drafts-')));
    await context().store.putPosting(
      posting({
        id: Id,
        review: { decision: 'approved', reason: null, reviewedAt: '2026-10-04T11:00:00.000Z' },
        status: 'queued',
      }),
    );
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('startApplication()', () => {
    it('stages the approved resume under its attachment name and opens a draft', async () => {
      expect.hasAssertions();
      await approveAResume();
      const started = await start();
      expect(started).toMatchObject({ applyVia: 'easy-apply', status: 'started' });
      await expect(
        fs.readFile(
          path.join(temporaryDirectory(), 'job-search-resume', Id, ResumeFileName),
          'utf-8',
        ),
      ).resolves.toBe('%PDF placeholder');
    });

    it('refuses a system that requires an account Nick has not approved', async () => {
      expect.hasAssertions();
      await context().store.putPosting(
        posting({
          applyUrl: 'https://hooli.wd5.myworkdayjobs.com/careers/job/1',
          applyVia: 'workday',
          id: Id,
          review: { decision: 'approved', reason: null, reviewedAt: '2026-10-04T11:00:00.000Z' },
          status: 'queued',
        }),
      );
      await expect(start()).resolves.toMatchObject({ status: 'refused' });
    });
  });

  describe('checkReading()', () => {
    it('verifies the planned values a reading shows, a typeahead by its leading name', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan);
      await expect(checkReading(context(), Id, filledReading)).resolves.toStrictEqual({
        mismatches: [],
        pending: [],
        resumeVerified: true,
      });
    });

    it('reports a value the form shows differently, and leaves it unverified', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan);
      await expect(
        checkReading(context(), Id, reading([field({ key: 'f0', label: 'Email', value: '' })])),
      ).resolves.toMatchObject({
        mismatches: [{ actual: '', expected: 'jane@example.com', label: 'Email' }],
        resumeVerified: false,
      });
    });

    it('verifies the resume shown selected among the uploaded resumes', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await expect(
        checkReading(
          context(),
          Id,
          reading([
            field({
              key: 'f9',
              label: '',
              options: ['PDF Old-Resume.pdf', `PDF ${ResumeFileName} 10/4/2026`],
              type: 'radio',
              value: `PDF ${ResumeFileName} 10/4/2026`,
            }),
          ]),
        ),
      ).resolves.toMatchObject({ resumeVerified: true });
    });
  });

  describe('marking the application filled', () => {
    it('refuses until every planned value and the resume have been seen', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan);
      await expect(markFilled(context(), Id, { byHand: false })).rejects.toThrow(
        'has not been seen attached',
      );
    });

    it('marks a verified application filled, and discards the draft on submission', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan);
      await checkReading(context(), Id, filledReading);
      await expect(markFilled(context(), Id, { byHand: false })).resolves.toMatchObject({
        status: 'filled',
      });
      await markSubmitted(context(), Id);
      await expect(readDraft(dataDirectory(), Id)).resolves.toBeNull();
    });
  });
});
