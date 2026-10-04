import fs from 'node:fs/promises';
import path from 'node:path';

import { omit } from 'lodash-es';
import { z } from 'zod';

import { withLedgerLock } from './budget/lock';
import { readTextFile } from './fs';
import {
  LinkedInJobIdPattern,
  type Posting,
  type PostingScore,
  PostingScoreSchema,
  type PostingStatus,
  type Preferences,
  type ReviewDecision,
} from './schemas';
import { type SessionContext } from './session';

/**
 * The directory, inside the repository's gitignored build output, where the browser server saves a
 * posting's text for {@link attachDescription} to move into the ledger.
 *
 * The browser server can save a script's output only inside the repository, and saving it there
 * keeps a posting's description out of the agent's context: it goes from the page to this file to
 * the ledger, and the scoring agent reads it from the ledger. A file here exists only until it is
 * attached.
 */
export const DescriptionScratchDirectory = path.join(process.cwd(), 'build', 'job-search');

/**
 * The shape of the file the `job-detail` page script saves: the posting's identifier and its text.
 */
const SavedDetailSchema = z.object({
  id: z.string().regex(LinkedInJobIdPattern),
  text: z.string().trim().min(1),
});

/**
 * The statuses from which a posting can be reviewed: those the scoring put in front of a person.
 */
const ReviewableStatuses = ['maybe', 'queued'] as const satisfies readonly PostingStatus[];

const requirePosting = async ({ store }: SessionContext, id: string): Promise<Posting> => {
  const posting = await store.getPosting(id);
  if (posting === null) {
    throw new Error(`There is no posting '${id}' in the ledger.`);
  }
  return posting;
};

const isWithin = (directory: string, file: string): boolean => {
  const relative = path.relative(directory, file);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Moves a posting's text, saved by the `job-detail` page script, into the posting's ledger record,
 * then deletes the saved file.
 *
 * @param {SessionContext} context The ledger and the data directory.
 * @param {string} file The saved file, which must lie in the scratch directory.
 * @param {string} scratchDirectory
 *   The directory saved postings are read from, {@link DescriptionScratchDirectory} by default.
 *
 * @throws {Error}
 *   If the file lies elsewhere, is missing or malformed, or names a posting the ledger does not
 *   hold.
 *
 * @returns {Promise<Posting>} The posting, with its description.
 */
export const attachDescription = (
  context: SessionContext,
  file: string,
  scratchDirectory: string = DescriptionScratchDirectory,
): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const resolved = path.resolve(file);
    if (!isWithin(scratchDirectory, resolved)) {
      throw new Error(
        `A saved posting must lie in '${scratchDirectory}', so that attaching it can ` +
          'safely delete it.',
      );
    }
    const text = await readTextFile(resolved);
    if (text === null) {
      throw new Error(`There is no saved posting at '${resolved}'.`);
    }
    const saved = SavedDetailSchema.safeParse(JSON.parse(text));
    if (!saved.success) {
      throw new Error(`The saved posting at '${resolved}' is invalid: ${saved.error.message}`);
    }
    const posting = await requirePosting(context, saved.data.id);
    const described: Posting = { ...posting, description: saved.data.text };
    await context.store.putPosting(described);
    await fs.rm(resolved, { force: true });
    return described;
  });

/**
 * Decides where a scored posting goes: dropped on any dealbreaker or below the maybe threshold,
 * into the review queue at or above the queue threshold, and onto the maybe list between the two.
 *
 * @param {PostingScore} score The scoring agent's assessment.
 * @param {Preferences['scoring']} scoring The thresholds from `preferences.yaml`.
 *
 * @returns {PostingStatus} The posting's status after scoring.
 */
export const statusForScore = (
  { dealbreakers, total }: PostingScore,
  { maybeAt, queueAt }: Preferences['scoring'],
): Extract<PostingStatus, 'dropped' | 'maybe' | 'queued'> => {
  if (dealbreakers.length > 0 || total < maybeAt) {
    return 'dropped';
  }
  return total >= queueAt ? 'queued' : 'maybe';
};

/**
 * Records the scoring agent's assessment of a pending posting, and moves it to the queue, the maybe
 * list or the dropped postings by the configured thresholds.
 *
 * @param {SessionContext} context The ledger, the preferences and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {unknown} score The assessment, validated here against its schema.
 *
 * @throws {Error} If the posting is missing or not pending, or the assessment is invalid.
 *
 * @returns {Promise<Posting>} The scored posting.
 */
export const recordScore = (
  context: SessionContext,
  id: string,
  score: unknown,
): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const parsed = PostingScoreSchema.safeParse(score);
    if (!parsed.success) {
      throw new Error(`The score for '${id}' is invalid: ${parsed.error.message}`);
    }
    const posting = await requirePosting(context, id);
    if (posting.status !== 'pending') {
      throw new Error(`The posting '${id}' is ${posting.status}, not pending its score.`);
    }
    const scored: Posting = {
      ...posting,
      score: parsed.data,
      status: statusForScore(parsed.data, context.preferences.scoring),
    };
    await context.store.putPosting(scored);
    return scored;
  });

/**
 * Records a person's review of a queued or maybe posting: an approval keeps it queued for applying,
 * and a skip sets it aside. The reason, when given, feeds the learning loop.
 *
 * @param {SessionContext} context The ledger, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {{ readonly decision: ReviewDecision; readonly reason: null | string }} review
 *   The decision, and the short reason given for it.
 *
 * @throws {Error} If the posting is missing or is not awaiting review.
 *
 * @returns {Promise<Posting>} The reviewed posting.
 */
export const reviewPosting = (
  context: SessionContext,
  id: string,
  { decision, reason }: { readonly decision: ReviewDecision; readonly reason: null | string },
): Promise<Posting> =>
  withLedgerLock(context.dataDirectory, async () => {
    const posting = await requirePosting(context, id);
    if (!ReviewableStatuses.some(status => status === posting.status)) {
      throw new Error(`The posting '${id}' is ${posting.status}, not awaiting review.`);
    }
    const reviewed: Posting = {
      ...posting,
      review: { decision, reason, reviewedAt: context.clock.now().toISOString() },
      status: decision === 'approved' ? 'queued' : 'skipped',
    };
    await context.store.putPosting(reviewed);
    return reviewed;
  });

/**
 * Lists the postings with a given status, most recently first seen first.
 */
export const listPostings = async (
  { store }: SessionContext,
  statuses: readonly PostingStatus[],
): Promise<Posting[]> =>
  (await store.listPostings()).records
    .filter(posting => statuses.includes(posting.status))
    .sort((a, b) => b.firstSeenAt.localeCompare(a.firstSeenAt));

/**
 * Lists the postings awaiting review — the queue and the maybe list — highest score first, without
 * their descriptions.
 */
export const reviewQueue = async (
  context: SessionContext,
): Promise<Omit<Posting, 'description'>[]> =>
  (await listPostings(context, ['queued', 'maybe']))
    .filter(posting => posting.review.decision === null)
    .sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0))
    .map(posting => omit(posting, ['description']));
