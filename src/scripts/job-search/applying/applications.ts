import { stringify } from 'yaml';

import { withLedgerLock } from '../budget/lock';
import { configFileIn, writeConfigFile } from '../config-files';
import { toWords } from '../ledger/fingerprint';
import { readYamlRecord } from '../ledger/yaml-records';
import { type Answers, AnswersSchema, type Posting, type Submitter } from '../schemas';
import { type SessionContext } from '../session';

import { discardDraft, requireSubmittableDraft, requireVerifiedDraft } from './drafts';
import { requireApprovedResume, requirePosting } from './requirements';

/**
 * Records that a posting's application has been filled and awaits Nick's submission, with the
 * hash of the approved resume it attaches.
 *
 * An application filled through its form must have a draft in which every planned value, and the
 * approved resume, has been seen in the form. One Nick filled by hand from its answer packet has no
 * draft, and is marked `byHand`.
 *
 * @param {SessionContext} context The ledger, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {{ readonly byHand: boolean }} options Whether Nick filled the application by hand.
 *
 * @throws {Error}
 *   If the posting was not approved in review, no resume is approved, the approved resume no longer
 *   matches its approval, or a form-filled application's draft is not verified.
 *
 * @returns {Promise<Posting>} The posting, now `filled`.
 */
export const markFilled = (
  context: SessionContext,
  id: string,
  { byHand }: { readonly byHand: boolean },
): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const posting = await requirePosting(context, id);
    if (posting.status !== 'queued' || posting.review.decision !== 'approved') {
      throw new Error(`The posting '${id}' is not approved for applying.`);
    }
    const resume = await requireApprovedResume(context.dataDirectory);
    if (!byHand) {
      await requireVerifiedDraft(context.dataDirectory, id, resume.manifest.sha256);
    }
    const filled: Posting = {
      ...posting,
      application: { resumeSha256: resume.manifest.sha256, submittedAt: null, submittedBy: null },
      status: 'filled',
    };
    await context.store.putPosting(filled);
    return filled;
  });

/**
 * Records that a filled application has been submitted, and by whom, and discards its draft and
 * staged resume.
 *
 * Nick's word that he submitted is recorded as given. The agent's submission is recorded only under
 * the `verified` submit policy, and only for an application whose draft is verified, unblocked and
 * not deferred — the same conditions under which it may click Submit at all.
 *
 * @param {SessionContext} context The ledger, the preferences, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {{ readonly by: Submitter }} submission Who submitted the application.
 *
 * @throws {Error}
 *   If the application has not been filled, or the agent submitted it without the policy allowing
 *   it or with a draft that does not qualify.
 *
 * @returns {Promise<Posting>} The posting, now `submitted`.
 */
export const markSubmitted = (
  context: SessionContext,
  id: string,
  { by }: { readonly by: Submitter },
): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const posting = await requirePosting(context, id);
    if (posting.status !== 'filled' || posting.application === null) {
      throw new Error(`The posting '${id}' has no filled application to submit.`);
    } else if (by === 'agent') {
      if (context.preferences.applying.submit !== 'verified') {
        throw new Error("The settings leave submitting to Nick ('applying.submit: nick').");
      }
      const resume = await requireApprovedResume(context.dataDirectory);
      await requireSubmittableDraft(context.dataDirectory, id, resume.manifest.sha256);
    }
    const submitted: Posting = {
      ...posting,
      application: {
        ...posting.application,
        submittedAt: context.clock.now().toISOString(),
        submittedBy: by,
      },
      status: 'submitted',
    };
    await context.store.putPosting(submitted);
    await discardDraft(context.dataDirectory, id);
    return submitted;
  });

/**
 * Records an application Nick made himself, from its answer packet, on a system the tooling does
 * not fill — one that needs an account, such as Workday — in one step: the approved resume he was
 * pointed to, and his word that he submitted.
 *
 * @param {SessionContext} context The ledger, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 *
 * @throws {Error} If the posting was not approved for applying, or no resume is approved.
 *
 * @returns {Promise<Posting>} The posting, now `submitted`.
 */
export const recordManualSubmission = (context: SessionContext, id: string): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const posting = await requirePosting(context, id);
    if (posting.status !== 'queued' || posting.review.decision !== 'approved') {
      throw new Error(`The posting '${id}' is not approved for applying.`);
    }
    const resume = await requireApprovedResume(context.dataDirectory);
    const submitted: Posting = {
      ...posting,
      application: {
        resumeSha256: resume.manifest.sha256,
        submittedAt: context.clock.now().toISOString(),
        submittedBy: 'nick',
      },
      status: 'submitted',
    };
    await context.store.putPosting(submitted);
    await discardDraft(context.dataDirectory, id);
    return submitted;
  });

/**
 * Saves Nick's answer to a form question the data did not answer, replacing any earlier answer to
 * the same question, so that the question is never asked twice.
 *
 * @param {SessionContext} context The data directory and the clock.
 * @param {{ readonly answer: string; readonly question: string }} entry
 *   The question as the form asked it, and Nick's answer.
 *
 * @throws {Error} If `answers.yaml` is missing or invalid.
 *
 * @returns {Promise<void>} A promise that resolves once the answer is saved.
 */
export const saveCustomAnswer = async (
  context: SessionContext,
  { answer, question }: { readonly answer: string; readonly question: string },
): Promise<void> => {
  const answers = await readYamlRecord(
    configFileIn(context.dataDirectory, 'answers'),
    AnswersSchema,
  );
  if (answers === null) {
    throw new Error('There is no answers.yaml. Run the job-search setup first.');
  }
  const key = toWords(question).join(' ');
  const updated: Answers = {
    ...answers,
    custom: [
      ...answers.custom.filter(entry => toWords(entry.question).join(' ') !== key),
      { addedAt: context.clock.now().toISOString(), answer, question: question.trim() },
    ],
  };
  await writeConfigFile(context.dataDirectory, 'answers', stringify(updated));
};
