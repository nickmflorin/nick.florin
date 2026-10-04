import fs from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { AccountRequirements, resolveApplyDestination } from '../discovery/apply-systems';
import { listDirectory } from '../fs';
import { toWords } from '../ledger/fingerprint';
import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { stageApprovedResume, unstageResume } from '../resume/staging';
import { type ApplicationSystem, TextSchema, TimestampSchema } from '../schemas';
import { type SessionContext } from '../session';

import { stageCoverLetter } from './cover-letters';
import { type FillPlan, isDocumentPicker } from './fill-plan';
import { PacketDirectoryName, packetFileFor } from './packets';
import {
  type FieldValue,
  FieldValueSchema,
  type FormReading,
  FormWidgets,
  type ReadField,
  ReadFieldTypes,
} from './form-scripts';
import { requireApprovedResume, requirePosting } from './requirements';

/**
 * The directory, inside the job-search data directory, that holds the drafts of the applications
 * being filled.
 */
export const DraftDirectoryName = 'drafts';

const DraftEntrySchema = z
  .object({
    key: z.string().min(1),
    label: z.string(),
    type: z.enum(ReadFieldTypes),
    value: FieldValueSchema,
    verified: z.boolean(),
    widget: z.enum(FormWidgets),
  })
  .strict();

type DraftEntry = z.infer<typeof DraftEntrySchema>;

/**
 * Why the agent may not submit an application until Nick acts on it: a cover letter the form
 * requires and he has not approved, a required question the data does not answer, a combobox whose options were never probed, a control the tooling cannot fill, a
 * value the form remembered from an earlier application rather than took from Nick's data, or a
 * required field no plan covered.
 */
export const BlockerKinds = [
  'cover-letter',
  'kept',
  'needs-options',
  'unanswered',
  'unplanned',
  'unsupported',
] as const;

/**
 * One blocker, with the step of the form it was found on — an Easy Apply step's progress, or
 * `form` for a single-page form — so that planning a step again replaces what was found on it
 * before.
 */
const BlockerSchema = z
  .object({ kind: z.enum(BlockerKinds), label: z.string(), step: z.string() })
  .strict();

export type Blocker = z.infer<typeof BlockerSchema>;

/**
 * The record of an application being filled: every value planned into the form, whether a later
 * reading of the form showed it took, and the approved resume staged for it.
 *
 * An application may be marked filled only once every planned value has been seen in the form and
 * the approved resume has been seen attached, so that a value a form silently dropped, or the
 * resume a form chose by default, is caught before anyone submits. The agent may submit it only
 * when, in addition, nothing blocks it; an application it cannot finish is deferred to Nick.
 */
export const ApplicationDraftSchema = z
  .object({
    blockers: z.array(BlockerSchema).default([]),
    coverLetter: z
      .object({ fileName: z.string(), stagedFile: z.string(), text: z.string() })
      .strict()
      .nullable()
      .default(null),
    deferral: z
      .object({ deferredAt: TimestampSchema, reason: TextSchema })
      .strict()
      .nullable()
      .default(null),
    entries: z.array(DraftEntrySchema),
    id: z.string(),
    resume: z
      .object({
        fileName: z.string(),
        sha256: z.string(),
        stagedFile: z.string(),
        verified: z.boolean(),
      })
      .strict(),
    startedAt: TimestampSchema,
  })
  .strict();

export type ApplicationDraft = z.infer<typeof ApplicationDraftSchema>;

export const draftFileFor = (dataDirectory: string, id: string): string =>
  path.join(dataDirectory, DraftDirectoryName, `${id}.yaml`);

export const readDraft = (dataDirectory: string, id: string): Promise<ApplicationDraft | null> =>
  readYamlRecord(draftFileFor(dataDirectory, id), ApplicationDraftSchema);

const requireDraft = async (dataDirectory: string, id: string): Promise<ApplicationDraft> => {
  const draft = await readDraft(dataDirectory, id);
  if (draft === null) {
    throw new Error(
      `No application to '${id}' has been started. Start it with 'jobs apply start'.`,
    );
  }
  return draft;
};

const writeDraft = (dataDirectory: string, draft: ApplicationDraft): Promise<void> =>
  writeYamlRecord(draftFileFor(dataDirectory, draft.id), draft, ApplicationDraftSchema);

export type ApplicationStart =
  | {
      readonly applyAt: string;
      readonly applyVia: ApplicationSystem;
      readonly draft: ApplicationDraft;
      readonly status: 'started';
    }
  | { readonly reason: string; readonly status: 'refused' };

/**
 * Explains why an application through a system that requires an account may not start, or returns
 * `null` when it may: the system needs no account, Nick's policy allows creating one, or he has
 * approved it for this application.
 */
const accountRefusal = (
  system: ApplicationSystem,
  { applying }: SessionContext['preferences'],
  accountApproved: boolean,
): null | string => {
  const requirement = AccountRequirements[system];
  if (requirement === 'no' || applying.newAccounts === 'allow') {
    return null;
  } else if (applying.newAccounts === 'never') {
    return `Applying through ${system} may require an account, which the settings leave to Nick.`;
  }
  return accountApproved
    ? null
    : `Applying through ${system} ${requirement === 'yes' ? 'requires' : 'may require'} ` +
        'creating an account. Ask Nick, and start again with --account-approved if he agrees.';
};

/**
 * Starts an application to an approved posting: checks that applying needs no account Nick has not
 * approved, stages the approved resume for upload, and opens a fresh draft.
 *
 * @param {SessionContext} context The ledger, the preferences, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {object} options
 *   Whether Nick has approved creating an account for this application, and the operating system's
 *   temporary directory, in which the resume is staged.
 *
 * @throws {Error} If the posting was not approved in review, or no resume is approved.
 *
 * @returns {Promise<ApplicationStart>}
 *   The refusal and its reason, or where to apply and the draft opened for the application.
 */
export const startApplication = async (
  context: SessionContext,
  id: string,
  {
    accountApproved,
    temporaryDirectory,
  }: { readonly accountApproved: boolean; readonly temporaryDirectory: string },
): Promise<ApplicationStart> => {
  const posting = await requirePosting(context, id);
  if (posting.status !== 'queued' || posting.review.decision !== 'approved') {
    throw new Error(`The posting '${id}' is not approved for applying.`);
  }
  const refusal = accountRefusal(posting.applyVia, context.preferences, accountApproved);
  if (refusal !== null) {
    return { reason: refusal, status: 'refused' };
  }
  const resume = await requireApprovedResume(context.dataDirectory);
  const previous = await readDraft(context.dataDirectory, id);
  if (previous !== null) {
    await unstageResume(previous.resume.stagedFile);
  }
  const stagedResume = await stageApprovedResume(resume, { id, temporaryDirectory });
  const draft: ApplicationDraft = {
    blockers: [],
    coverLetter: await stageCoverLetter(context, id, path.dirname(stagedResume)),
    deferral: null,
    entries: [],
    id,
    resume: {
      fileName: resume.manifest.fileName,
      sha256: resume.manifest.sha256,
      stagedFile: stagedResume,
      verified: false,
    },
    startedAt: context.clock.now().toISOString(),
  };
  await writeDraft(context.dataDirectory, draft);
  return {
    applyAt:
      posting.applyUrl === null
        ? posting.url
        : (resolveApplyDestination(posting.applyUrl)?.href ?? posting.applyUrl),
    applyVia: posting.applyVia,
    draft,
    status: 'started',
  };
};

const stepOf = ({ progress }: FormReading): string => progress ?? 'form';

/**
 * Records a plan's values in the application's draft, unverified, replacing any earlier plan for
 * the same fields, and what blocks the step from being submitted unattended, replacing what was
 * found on the step before.
 *
 * @param {SessionContext} context The data directory.
 * @param {string} id The job identifier of the posting.
 * @param {FillPlan} plan The plan for one reading of the form.
 * @param {FormReading} reading The reading the plan was made from.
 *
 * @throws {Error} If no application to the posting has been started.
 *
 * @returns {Promise<ApplicationDraft>} The updated draft.
 */
export const recordPlan = async (
  { dataDirectory }: SessionContext,
  id: string,
  plan: FillPlan,
  reading: FormReading,
): Promise<ApplicationDraft> => {
  const draft = await requireDraft(dataDirectory, id);
  const step = stepOf(reading);
  const blockers: Blocker[] = [
    ...plan.coverLetters.map(({ label }) => ({ kind: 'cover-letter' as const, label, step })),
    ...plan.unanswered.map(({ label }) => ({ kind: 'unanswered' as const, label, step })),
    ...plan.needsOptions.map(({ label }) => ({ kind: 'needs-options' as const, label, step })),
    ...plan.kept.map(({ label }) => ({ kind: 'kept' as const, label, step })),
    ...reading.unsupported.map(label => ({ kind: 'unsupported' as const, label, step })),
  ];
  const planned: DraftEntry[] = [
    ...[...plan.fills, ...plan.interactive].map(fill => ({ ...fill, verified: false })),
    ...plan.uploads.map(({ file, key, label }) => ({
      key,
      label,
      type: 'file' as const,
      value: path.basename(file),
      verified: false,
      widget: 'file' as const,
    })),
  ];
  const updated: ApplicationDraft = {
    ...draft,
    blockers: [...draft.blockers.filter(blocker => blocker.step !== step), ...blockers],
    entries: [
      ...draft.entries.filter(entry => !planned.some(({ key }) => key === entry.key)),
      ...planned,
    ],
  };
  await writeDraft(dataDirectory, updated);
  return updated;
};

const normalized = (value: string): string => toWords(value).join(' ');

/**
 * The part of a place before its first comma, which is all a typeahead's chosen suggestion is
 * expected to share with the value typed into it: "Washington, DC" may be chosen as "Washington,
 * District of Columbia, United States".
 */
const placeHead = (value: string): string => normalized(value.split(',').at(0) ?? '');

const sameMembers = (expected: readonly string[], actual: readonly string[]): boolean =>
  expected.length === actual.length && expected.every(value => actual.includes(value));

const shows = (entry: DraftEntry, actual: FieldValue | null): boolean => {
  if (typeof entry.value === 'boolean') {
    return actual === entry.value;
  } else if (Array.isArray(entry.value)) {
    return Array.isArray(actual) && sameMembers(entry.value, actual);
  } else if (typeof actual !== 'string') {
    return false;
  }
  return entry.widget === 'typeahead'
    ? placeHead(actual) === placeHead(entry.value)
    : normalized(actual) === normalized(entry.value);
};

/**
 * Whether a reading shows the resume attached: a file input holding it, or a selected option — the
 * resume LinkedIn shows selected among the uploaded ones — that names it.
 */
const resumeShownIn = ({ fields }: FormReading, fileName: string): boolean =>
  fields.some(
    ({ type, value }) =>
      (type === 'file' && Array.isArray(value) && value.includes(fileName)) ||
      (type === 'radio' && typeof value === 'string' && value.includes(fileName)),
  );

export interface DraftCheck {
  /**
   * Everything that keeps the application from being submitted unattended, across its steps.
   */
  readonly blockers: Blocker[];
  readonly mismatches: {
    readonly actual: FieldValue | null;
    readonly expected: FieldValue;
    readonly label: string;
  }[];
  /**
   * The labels of the planned values not yet seen in the form.
   */
  readonly pending: string[];
  readonly resumeVerified: boolean;
}

/**
 * Checks a reading of the form, taken after it was filled, against the values planned for the
 * fields it shows, and records which took. A field the reading does not show — one on another
 * step — keeps what was recorded for it. A required field that no plan covered and no blocker
 * already names is recorded as a blocker.
 *
 * @param {SessionContext} context The data directory.
 * @param {string} id The job identifier of the posting.
 * @param {FormReading} reading The form reader's reading, taken after filling.
 *
 * @throws {Error} If no application to the posting has been started.
 *
 * @returns {Promise<DraftCheck>}
 *   The values the form does not show as planned, the values still unseen, whether the resume has
 *   been seen attached, and what blocks an unattended submission.
 */
export const checkReading = async (
  { dataDirectory }: SessionContext,
  id: string,
  reading: FormReading,
): Promise<DraftCheck> => {
  const draft = await requireDraft(dataDirectory, id);
  const resumeShown = resumeShownIn(reading, draft.resume.fileName);
  const fields = new Map<string, ReadField>(reading.fields.map(field => [field.key, field]));
  const checked = draft.entries.map(entry => {
    const field = fields.get(entry.key);
    if (entry.type === 'file') {
      const attached =
        typeof entry.value === 'string' &&
        ((Array.isArray(field?.value) && field.value.includes(entry.value)) ||
          (entry.value === draft.resume.fileName && resumeShown));
      return { entry: { ...entry, verified: entry.verified || attached }, mismatch: null };
    } else if (field === undefined) {
      return { entry, mismatch: null };
    }
    const verified = shows(entry, field.value);
    return {
      entry: { ...entry, verified },
      mismatch: verified
        ? null
        : { actual: field.value, expected: entry.value, label: entry.label },
    };
  });
  const step = stepOf(reading);
  const named = new Set(
    draft.blockers
      .filter(blocker => blocker.step === step && blocker.kind !== 'unplanned')
      .map(({ label }) => label),
  );
  const unplanned: Blocker[] = reading.fields
    .filter(
      field =>
        field.required &&
        field.type !== 'file' &&
        !isDocumentPicker(field) &&
        !draft.entries.some(({ key }) => key === field.key) &&
        !named.has(field.label),
    )
    .map(({ label }) => ({ kind: 'unplanned' as const, label, step }));
  const updated: ApplicationDraft = {
    ...draft,
    blockers: [
      ...draft.blockers.filter(blocker => blocker.step !== step || blocker.kind !== 'unplanned'),
      ...unplanned,
    ],
    entries: checked.map(({ entry }) => entry),
    resume: { ...draft.resume, verified: draft.resume.verified || resumeShown },
  };
  await writeDraft(dataDirectory, updated);
  return {
    blockers: updated.blockers,
    mismatches: checked.flatMap(({ mismatch }) => (mismatch === null ? [] : [mismatch])),
    pending: updated.entries.filter(({ verified }) => !verified).map(({ label }) => label),
    resumeVerified: updated.resume.verified,
  };
};

/**
 * Reads an application's draft, requiring that every planned value and the approved resume have
 * been seen in the form.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {string} id The job identifier of the posting.
 * @param {string} sha256 The hash of the resume approved now.
 *
 * @throws {Error}
 *   If no application was started, the resume was never seen attached, the approved resume changed
 *   since the application started, or a planned value was never seen in the form.
 *
 * @returns {Promise<ApplicationDraft>} The draft, with every value and the resume seen in the form.
 */
export const requireVerifiedDraft = async (
  dataDirectory: string,
  id: string,
  sha256: string,
): Promise<ApplicationDraft> => {
  const draft = await requireDraft(dataDirectory, id);
  const pending = draft.entries.filter(({ verified }) => !verified);
  if (draft.resume.sha256 !== sha256) {
    throw new Error('The approved resume changed after the application started. Start it again.');
  } else if (!draft.resume.verified) {
    throw new Error(
      'The approved resume has not been seen attached to the application. Upload it, then check ' +
        'the form again.',
    );
  } else if (pending.length > 0) {
    throw new Error(
      `Not every planned value has been seen in the form: ${pending
        .map(({ label }) => label)
        .join('; ')}. Check the form again.`,
    );
  }
  return draft;
};

/**
 * Reads an application's draft, requiring that the agent may submit it unattended: verified as
 * {@link requireVerifiedDraft} requires, with nothing blocking it and no deferral.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {string} id The job identifier of the posting.
 * @param {string} sha256 The hash of the resume approved now.
 *
 * @throws {Error} If the draft is not verified, something blocks it, or it was deferred to Nick.
 *
 * @returns {Promise<ApplicationDraft>} The draft, cleared for the agent to submit.
 */
export const requireSubmittableDraft = async (
  dataDirectory: string,
  id: string,
  sha256: string,
): Promise<ApplicationDraft> => {
  const draft = await requireVerifiedDraft(dataDirectory, id, sha256);
  if (draft.deferral !== null) {
    throw new Error(`The application was deferred to Nick: ${draft.deferral.reason}`);
  } else if (draft.blockers.length > 0) {
    throw new Error(
      `The application needs Nick first: ${draft.blockers
        .map(({ kind, label }) => `${label} (${kind})`)
        .join('; ')}.`,
    );
  }
  return draft;
};

/**
 * Sets an application aside for Nick — a question only he can answer, a submission whose
 * confirmation never appeared — and removes its staged resume, keeping the draft, with its
 * blockers, for {@link listHeldApplications}.
 *
 * @param {SessionContext} context The data directory and the clock.
 * @param {string} id The job identifier of the posting.
 * @param {string} reason Why the application is set aside.
 *
 * @throws {Error} If no application to the posting has been started.
 *
 * @returns {Promise<ApplicationDraft>} The deferred draft.
 */
export const deferApplication = async (
  { clock, dataDirectory }: SessionContext,
  id: string,
  reason: string,
): Promise<ApplicationDraft> => {
  const draft = await requireDraft(dataDirectory, id);
  await unstageResume(draft.resume.stagedFile);
  const deferred: ApplicationDraft = {
    ...draft,
    deferral: { deferredAt: clock.now().toISOString(), reason: reason.trim() },
  };
  await writeDraft(dataDirectory, deferred);
  return deferred;
};

export interface HeldApplication {
  readonly blockers: Blocker[];
  readonly company: string;
  readonly id: string;
  /**
   * The answer packet of an application handed to Nick to make by hand, or `null`.
   */
  readonly packet: null | string;
  readonly reason: null | string;
  readonly title: string;
}

/**
 * Lists the applications waiting on Nick: those deferred to him, those whose drafts hold blockers,
 * and those handed to him to make by hand from an answer packet, while the posting is still
 * approved and unapplied — the one list an unattended run hands him, in place of interrupting it.
 *
 * @param {SessionContext} context The ledger and the data directory.
 *
 * @returns {Promise<HeldApplication[]>} Each held application, with why it is held.
 */
export const listHeldApplications = async (context: SessionContext): Promise<HeldApplication[]> => {
  const drafts = await Promise.all(
    (await listDirectory(path.join(context.dataDirectory, DraftDirectoryName)))
      .filter(name => name.endsWith('.yaml'))
      .map(name => readDraft(context.dataDirectory, name.replace(/\.yaml$/, ''))),
  );
  const held = drafts.filter(
    (draft): draft is ApplicationDraft =>
      draft !== null && (draft.deferral !== null || draft.blockers.length > 0),
  );
  const handedOff = await Promise.all(
    (await listDirectory(path.join(context.dataDirectory, PacketDirectoryName)))
      .filter(name => name.endsWith('.md'))
      .map(name => name.replace(/\.md$/, ''))
      .filter(id => !held.some(draft => draft.id === id))
      .map(id => context.store.getPosting(id)),
  );
  return [
    ...(await Promise.all(
      held.map(async ({ blockers, deferral, id }) => {
        const { company, title } = await requirePosting(context, id);
        return { blockers, company, id, packet: null, reason: deferral?.reason ?? null, title };
      }),
    )),
    ...handedOff
      .filter(
        (posting): posting is NonNullable<typeof posting> =>
          posting !== null && posting.status === 'queued' && posting.review.decision === 'approved',
      )
      .map(({ applyVia, company, id, title }) => ({
        blockers: [],
        company,
        id,
        packet: packetFileFor(context.dataDirectory, id),
        reason: `Apply by hand: ${applyVia} is not filled by the tooling.`,
        title,
      })),
  ];
};

/**
 * Removes an application's draft and its staged resume, once it has been submitted or abandoned.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {string} id The job identifier of the posting.
 *
 * @returns {Promise<boolean>} Whether there was a draft to remove.
 */
export const discardDraft = async (dataDirectory: string, id: string): Promise<boolean> => {
  const draft = await readDraft(dataDirectory, id);
  if (draft === null) {
    return false;
  }
  await unstageResume(draft.resume.stagedFile);
  await fs.rm(draftFileFor(dataDirectory, id), { force: true });
  return true;
};
