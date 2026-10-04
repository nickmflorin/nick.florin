import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { markFilled, markSubmitted } from '~/scripts/job-search/applying/applications';
import {
  checkReading,
  deferApplication,
  listHeldApplications,
  readDraft,
  recordPlan,
  startApplication,
} from '~/scripts/job-search/applying/drafts';
import { type FillPlan } from '~/scripts/job-search/applying/fill-plan';
import { type FormReading, type ReadField } from '~/scripts/job-search/applying/form-scripts';
import { packetFileFor } from '~/scripts/job-search/applying/packets';
import { YamlLedgerStore } from '~/scripts/job-search/ledger/yaml-ledger-store';
import { approveResume } from '~/scripts/job-search/resume/approved-resume';
import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { type SessionContext } from '~/scripts/job-search/session';

import { MinimalPreferences, posting } from './fixtures';

let sandbox = '';

const dataDirectory = (): string => path.join(sandbox, 'data');

const temporaryDirectory = (): string => path.join(sandbox, 'tmp');

const context = (applying: object = {}): SessionContext => ({
  clock: {
    now: () => new Date('2026-10-04T12:00:00.000Z'),
    random: () => 0,
    sleep: () => Promise.resolve(),
  },
  dataDirectory: dataDirectory(),
  preferences: PreferencesSchema.parse({ ...MinimalPreferences, applying }),
  store: new YamlLedgerStore(dataDirectory()),
});

/**
 * The settings under which the agent submits a verified application itself.
 */
const AgentSubmits = { submit: 'verified' };

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
  signIn: false,
  text: '',
  unsupported: [],
  url: 'https://boards.example.com/apply',
});

const Plan: FillPlan = {
  coverLetters: [],
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
      await recordPlan(context(), Id, Plan, filledReading);
      await expect(checkReading(context(), Id, filledReading)).resolves.toStrictEqual({
        blockers: [],
        mismatches: [],
        pending: [],
        resumeVerified: true,
      });
    });

    it('reports a value the form shows differently, and leaves it unverified', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan, filledReading);
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
      await recordPlan(context(), Id, Plan, filledReading);
      await expect(markFilled(context(), Id, { byHand: false })).rejects.toThrow(
        'has not been seen attached',
      );
    });

    it('marks a verified application filled, and discards the draft on submission', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan, filledReading);
      await checkReading(context(), Id, filledReading);
      await expect(markFilled(context(), Id, { byHand: false })).resolves.toMatchObject({
        status: 'filled',
      });
      await markSubmitted(context(), Id, { by: 'nick' });
      await expect(readDraft(dataDirectory(), Id)).resolves.toBeNull();
    });
  });

  describe('blockers and deferral', () => {
    it('records what blocks a step, and replaces it when the step is planned again', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(
        context(),
        Id,
        {
          ...Plan,
          unanswered: [{ current: null, key: 'f3', label: 'Describe a bug', required: true }],
        },
        filledReading,
      );
      await recordPlan(context(), Id, Plan, filledReading);
      await expect(readDraft(dataDirectory(), Id)).resolves.toMatchObject({ blockers: [] });
    });

    it('records a required field that no plan covered', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan, filledReading);
      await expect(
        checkReading(
          context(),
          Id,
          reading([...filledReading.fields, field({ key: 'f4', label: 'Years in Rust' })]),
        ),
      ).resolves.toMatchObject({
        blockers: [{ kind: 'unplanned', label: 'Years in Rust', step: 'form' }],
      });
    });

    it('lists a deferred application, with why, for Nick', async () => {
      expect.hasAssertions();
      await approveAResume();
      await start();
      await deferApplication(context(), Id, {
        notSubmitted: false,
        reason: 'Two screening questions need Nick',
      });
      await expect(listHeldApplications(context())).resolves.toStrictEqual([
        {
          blockers: [],
          company: posting().company,
          id: Id,
          packet: null,
          reason: 'Two screening questions need Nick',
          title: posting().title,
        },
      ]);
    });
  });

  describe('hand-offs', () => {
    it('lists an approved posting with an answer packet for Nick to apply to by hand', async () => {
      expect.hasAssertions();
      await fs.mkdir(path.dirname(packetFileFor(dataDirectory(), Id)), { recursive: true });
      await fs.writeFile(packetFileFor(dataDirectory(), Id), '# Packet');
      const [held] = await listHeldApplications(context());
      expect([held.packet, held.reason?.startsWith('Apply by hand')]).toStrictEqual([
        packetFileFor(dataDirectory(), Id),
        true,
      ]);
    });
  });

  describe("recording the agent's submission", () => {
    const fillVerified = async (): Promise<void> => {
      await approveAResume();
      await start();
      await recordPlan(context(), Id, Plan, filledReading);
      await checkReading(context(), Id, filledReading);
      await markFilled(context(), Id, { byHand: false });
    };

    it('refuses while the settings leave submitting to Nick', async () => {
      expect.hasAssertions();
      await fillVerified();
      await expect(markSubmitted(context(), Id, { by: 'agent' })).rejects.toThrow(
        'leave submitting to Nick',
      );
    });

    it('refuses an application with something blocking it', async () => {
      expect.hasAssertions();
      await fillVerified();
      await recordPlan(
        context(),
        Id,
        {
          coverLetters: [],
          fills: [],
          interactive: [],
          kept: [{ current: 'Green', key: 'f5', label: 'Color', required: false }],
          needsOptions: [],
          unanswered: [],
          uploads: [],
        },
        reading([]),
      );
      await expect(markSubmitted(context(AgentSubmits), Id, { by: 'agent' })).rejects.toThrow(
        'needs Nick first',
      );
    });

    it('refuses an application deferred to Nick', async () => {
      expect.hasAssertions();
      await fillVerified();
      await deferApplication(context(), Id, {
        notSubmitted: false,
        reason: 'No confirmation appeared',
      });
      await expect(markSubmitted(context(AgentSubmits), Id, { by: 'agent' })).rejects.toThrow(
        'deferred to Nick',
      );
    });

    it('puts a submission the site refused back in the queue, to start again', async () => {
      expect.hasAssertions();
      await fillVerified();
      await deferApplication(context(), Id, {
        notSubmitted: true,
        reason: 'Flagged as possible spam',
      });
      await expect(context().store.getPosting(Id)).resolves.toMatchObject({
        application: null,
        status: 'queued',
      });
    });

    it("records a verified, unblocked submission as the agent's", async () => {
      expect.hasAssertions();
      await fillVerified();
      await expect(
        markSubmitted(context(AgentSubmits), Id, { by: 'agent' }),
      ).resolves.toMatchObject({ application: { submittedBy: 'agent' }, status: 'submitted' });
    });
  });
});
