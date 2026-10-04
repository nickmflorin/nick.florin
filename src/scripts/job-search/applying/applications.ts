import path from 'node:path';

import { stringify } from 'yaml';

import { withLedgerLock } from '../budget/lock';
import { configFileIn, writeConfigFile } from '../config-files';
import { AccountRequirements, resolveApplyDestination } from '../discovery/apply-systems';
import { toWords } from '../ledger/fingerprint';
import { readYamlRecord } from '../ledger/yaml-records';
import { type Answers, AnswersSchema, type Posting } from '../schemas';
import { type SessionContext } from '../session';

import { type ResolvedAnswer } from './answers';
import { discardDraft, requireVerifiedDraft } from './drafts';
import { requireApprovedResume, requirePosting } from './requirements';

/**
 * The directory, inside the job-search data directory, that holds the answer packets for postings
 * applied to outside an automated form.
 */
export const PacketDirectoryName = 'packets';

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
      application: { resumeSha256: resume.manifest.sha256, submittedAt: null },
      status: 'filled',
    };
    await context.store.putPosting(filled);
    return filled;
  });

/**
 * Records that Nick has submitted a filled application, and discards its draft and staged resume.
 * Only Nick submits; this records his word that he has.
 *
 * @param {SessionContext} context The ledger, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 *
 * @throws {Error} If the posting's application has not been filled.
 *
 * @returns {Promise<Posting>} The posting, now `submitted`.
 */
export const markSubmitted = (context: SessionContext, id: string): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const posting = await requirePosting(context, id);
    if (posting.status !== 'filled' || posting.application === null) {
      throw new Error(`The posting '${id}' has no filled application to submit.`);
    }
    const submitted: Posting = {
      ...posting,
      application: { ...posting.application, submittedAt: context.clock.now().toISOString() },
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

export interface PacketInput {
  readonly answers: readonly ResolvedAnswer[];
  readonly posting: Posting;
  readonly resumeFile: string;
  /**
   * The years of experience with the competencies the posting's description names.
   */
  readonly years: readonly { readonly label: string; readonly years: number }[];
}

/**
 * Renders the answer packet for a posting applied to by hand: where to apply, whether that needs an
 * account, the resume to attach, and every standard answer, so that the application takes minutes.
 *
 * @param {PacketInput} input The posting, the resolved answers, the resume and the years table.
 *
 * @returns {string} The packet, as Markdown.
 */
export const renderPacket = ({ answers, posting, resumeFile, years }: PacketInput): string => {
  const destination =
    posting.applyUrl === null ? null : resolveApplyDestination(posting.applyUrl)?.href;
  return [
    `# ${posting.title} — ${posting.company}`,
    '',
    `- Posting: ${posting.url}`,
    `- Apply at: ${destination ?? 'Easy Apply, on the posting'}`,
    `- Applies through: ${posting.applyVia}`,
    `- Needs an account: ${AccountRequirements[posting.applyVia]}`,
    `- Resume to attach: ${resumeFile}`,
    ...(posting.score === null ? [] : [`- Score: ${posting.score.total}`]),
    '',
    '## Answers',
    '',
    ...answers.map(answer =>
      'unanswered' in answer
        ? `- ${answer.label}: _not in the data — answer it, then save it with \`jobs answers add\`_`
        : `- ${answer.label}: ${answer.value}`,
    ),
    '',
    '## Years of experience',
    '',
    ...(years.length === 0
      ? ['_No competency in the digest is named in the description._']
      : years.map(({ label, years: count }) => `- ${label}: ${count}`)),
    '',
  ].join('\n');
};

export const packetFileFor = (dataDirectory: string, id: string): string =>
  path.join(dataDirectory, PacketDirectoryName, `${id}.md`);
