import path from 'node:path';

import { AccountRequirements, resolveApplyDestination } from '../discovery/apply-systems';
import { type Posting } from '../schemas';

import { type ResolvedAnswer } from './answers';

/**
 * The directory, inside the job-search data directory, that holds the answer packets for postings
 * applied to outside an automated form.
 */
export const PacketDirectoryName = 'packets';

/**
 * Shows an answer as Nick would type it into a form: the stored `decline` of a voluntary
 * self-identification question as the wording such forms offer.
 */
const shownAnswer = (value: string): string =>
  value === 'decline' ? 'Decline to self-identify' : value;

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
        : `- ${answer.label}: ${shownAnswer(answer.value)}`,
    ),
    '',
    '## Years of experience',
    '',
    ...(years.length === 0
      ? ['_No competency in the digest is named in the description._']
      : years.map(({ label, years: count }) => `- ${label}: ${count}`)),
    '',
    '## When it is submitted',
    '',
    `Tell Claude, or record it with \`pnpm --silent jobs application submitted ${posting.id} ` +
      '--by-hand`.',
    '',
  ].join('\n');
};

export const packetFileFor = (dataDirectory: string, id: string): string =>
  path.join(dataDirectory, PacketDirectoryName, `${id}.md`);
