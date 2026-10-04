import fs from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { AccountRequirements, resolveApplyDestination } from '../discovery/apply-systems';
import { toWords } from '../ledger/fingerprint';
import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { stageApprovedResume, unstageResume } from '../resume/staging';
import { type ApplicationSystem, TimestampSchema } from '../schemas';
import { type SessionContext } from '../session';

import { type FillPlan } from './fill-plan';
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
 * The record of an application being filled: every value planned into the form, whether a later
 * reading of the form showed it took, and the approved resume staged for it.
 *
 * An application may be marked filled only once every planned value has been seen in the form and
 * the approved resume has been seen attached, so that a value a form silently dropped, or the
 * resume a form chose by default, is caught before Nick is asked to submit.
 */
export const ApplicationDraftSchema = z
  .object({
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
  const draft: ApplicationDraft = {
    entries: [],
    id,
    resume: {
      fileName: resume.manifest.fileName,
      sha256: resume.manifest.sha256,
      stagedFile: await stageApprovedResume(resume, { id, temporaryDirectory }),
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

/**
 * Records a plan's values in the application's draft, unverified, replacing any earlier plan for
 * the same fields.
 *
 * @param {SessionContext} context The data directory.
 * @param {string} id The job identifier of the posting.
 * @param {FillPlan} plan The plan for one reading of the form.
 *
 * @throws {Error} If no application to the posting has been started.
 *
 * @returns {Promise<ApplicationDraft>} The updated draft.
 */
export const recordPlan = async (
  { dataDirectory }: SessionContext,
  id: string,
  plan: FillPlan,
): Promise<ApplicationDraft> => {
  const draft = await requireDraft(dataDirectory, id);
  const planned: DraftEntry[] = [
    ...[...plan.fills, ...plan.interactive].map(fill => ({ ...fill, verified: false })),
    ...plan.uploads.map(({ key, label }) => ({
      key,
      label,
      type: 'file' as const,
      value: draft.resume.fileName,
      verified: false,
      widget: 'file' as const,
    })),
  ];
  const updated: ApplicationDraft = {
    ...draft,
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
 * step — keeps what was recorded for it.
 *
 * @param {SessionContext} context The data directory.
 * @param {string} id The job identifier of the posting.
 * @param {FormReading} reading The form reader's reading, taken after filling.
 *
 * @throws {Error} If no application to the posting has been started.
 *
 * @returns {Promise<DraftCheck>}
 *   The values the form does not show as planned, the values still unseen, and whether the resume
 *   has been seen attached.
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
      return { entry: { ...entry, verified: entry.verified || resumeShown }, mismatch: null };
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
  const updated: ApplicationDraft = {
    ...draft,
    entries: checked.map(({ entry }) => entry),
    resume: { ...draft.resume, verified: draft.resume.verified || resumeShown },
  };
  await writeDraft(dataDirectory, updated);
  return {
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
 * @returns {Promise<ApplicationDraft>} The verified draft.
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
