import { omit } from 'lodash-es';

import { describePosting } from '../postings';
import { type Candidate } from '../schemas';
import { type SessionContext, takeBudget, triageBatch, type TriageBatchResult } from '../session';

import { factLinesOf, parseCards } from './cards';
import {
  detailCandidate,
  type JobDetail,
  JobDetailSchema,
  OpenedCardSchema,
} from './detail-candidates';
import { type PageDriver, pageProblemOf, readPageCards } from './page-driver';
import { openCardScript, PageScripts } from './page-scripts';
import { matchPageCards, type PageMatch, unopenedFromPool } from './pool';

const LinkedInJobViewUrl = 'https://www.linkedin.com/jobs/view/';

/**
 * How many times the opened posting is read before it is taken not to have loaded, and how long to
 * wait between reads.
 */
const DetailReadAttempts = 8;

const DetailReadIntervalMs = 1000;

/**
 * What became of one posting the command tried to open. Only `opened` yields a text that may be
 * saved; `closed` means the posting no longer accepts applications, so it is not recorded;
 * `id-mismatch` means the page showed a posting other than the target, so nothing was saved.
 */
export type OpenOutcome =
  | 'budget-refused'
  | 'challenge'
  | 'closed'
  | 'id-mismatch'
  | 'logged-out'
  | 'not-found'
  | 'not-loaded'
  | 'opened';

export interface OpenAttempt {
  readonly company: string;
  readonly outcome: OpenOutcome;
  readonly title: string;
}

/**
 * A posting that was opened and verified: the text on the page belongs to the target.
 */
interface VerifiedOpening {
  readonly detail: JobDetail;
  readonly id: string;
  readonly pooled: Candidate;
}

export type OpenPoolResult =
  | {
      readonly attempts: OpenAttempt[];
      /**
       * The lines of each opened posting that state pay, size, sponsorship or an office
       * arrangement, by job identifier, for the agent to read in context.
       */
      readonly facts: Record<string, string[]>;
      /**
       * The cards the page showed, and how many of the run's unopened pool they matched.
       */
      readonly matched: number;
      readonly onPage: number;
      /**
       * Why opening stopped early — a spent budget, a security step, a sign-in page — or `null`
       * when every match was tried. An early stop is reported as `refused`, after the postings
       * already opened were triaged and recorded.
       */
      readonly reason: null | string;
      readonly status: 'opened' | 'refused';
      readonly triage: null | Omit<TriageBatchResult, 'unreadable'>;
      readonly unopened: number;
    }
  | { readonly reason: string; readonly status: 'refused' };

const readDetail = async (driver: PageDriver): Promise<JobDetail | null> => {
  try {
    const parsed = JobDetailSchema.safeParse(await driver.run(PageScripts['job-detail']));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/**
 * Reads the posting open in the page until it is the one expected, so that a text is never taken
 * from the previous posting while the page is still changing.
 */
const awaitDetail = async (
  driver: PageDriver,
  sleep: SessionContext['clock']['sleep'],
  expectedId: string,
): Promise<JobDetail | null> => {
  let detail: JobDetail | null = null;
  for (let attempt = 0; attempt < DetailReadAttempts; attempt += 1) {
    /* eslint-disable-next-line no-await-in-loop -- Each read waits for the page to settle. */
    detail = await readDetail(driver);
    if (detail !== null && detail.id === expectedId && detail.text.trim() !== '') {
      return detail;
    } else if (detail !== null && pageProblemOf(detail.url) !== null) {
      return detail;
    }
    /* eslint-disable-next-line no-await-in-loop -- Each read waits for the page to settle. */
    await sleep(DetailReadIntervalMs);
  }
  return detail;
};

type Opening =
  | { readonly detail: JobDetail; readonly id: string; readonly outcome: 'opened' }
  | { readonly outcome: Exclude<OpenOutcome, 'opened'> };

/**
 * Opens one posting and reads its text, verifying that the text is the target's.
 *
 * A card whose identifier is known — the recommendations page publishes it — is opened by loading
 * the posting's own page, because clicking a recommendation does not change the page's current job.
 * A card without one is clicked, and the identifier it opens is checked against those already
 * opened, so a click that left the page showing the previous posting is refused.
 */
const openPosting = async (
  driver: PageDriver,
  sleep: SessionContext['clock']['sleep'],
  { card, pooled }: PageMatch,
  alreadyOpened: ReadonlySet<string>,
): Promise<Opening> => {
  const knownId = card.id ?? pooled.id;
  let expectedId = knownId;
  if (knownId === null) {
    const clicked = OpenedCardSchema.parse(
      await driver.run(openCardScript({ company: card.company, title: card.title })),
    );
    if (!clicked.found) {
      return { outcome: 'not-found' };
    } else if (!clicked.loaded || clicked.id === null) {
      return { outcome: 'not-loaded' };
    }
    expectedId = clicked.id;
  } else {
    await driver.navigate(`${LinkedInJobViewUrl}${knownId}/`);
  }
  if (expectedId === null || alreadyOpened.has(expectedId)) {
    return { outcome: 'id-mismatch' };
  }
  const detail = await awaitDetail(driver, sleep, expectedId);
  const problem = detail === null ? null : pageProblemOf(detail.url);
  if (problem !== null) {
    return { outcome: problem };
  } else if (detail === null || detail.text.trim() === '') {
    return { outcome: 'not-loaded' };
  }
  if (detail.id !== expectedId) {
    return { outcome: 'id-mismatch' };
  }
  return detail.closed ? { outcome: 'closed' } : { detail, id: expectedId, outcome: 'opened' };
};

/**
 * Opens the postings of a run's pool that the page in view shows, records the ones that pass the
 * detail-stage triage, and attaches each one's text to its ledger record.
 *
 * LinkedIn's results differ on every load, so the page is matched against the whole unopened pool
 * rather than its ranked top. Each posting costs one page view, taken and received before the
 * browser acts. A text is saved only when the page showed the target's own job identifier. The
 * cards that can be clicked are opened first, because loading a posting's own page leaves the
 * results.
 *
 * @param {SessionContext} context The ledger, the preferences, the clock and the data directory.
 * @param {PageDriver} driver The job-search Chrome's page, showing a search or the recommendations.
 * @param {string} runId The run the pool belongs to.
 * @param {number} limit How many postings to open at most.
 *
 * @returns {Promise<OpenPoolResult>} What was opened, triaged and recorded, or the page's problem.
 */
export const openPoolMatches = async (
  context: SessionContext,
  driver: PageDriver,
  runId: string,
  limit: number,
): Promise<OpenPoolResult> => {
  const reading = await readPageCards(driver, context.clock.sleep);
  const problem = pageProblemOf(reading.url);
  if (problem !== null) {
    return {
      reason:
        `The page is a ${problem === 'challenge' ? 'security step' : 'sign-in page'} ` +
        `(${reading.url}): finish the run with --ended-by ${problem}.`,
      status: 'refused',
    };
  }
  const { facts: cards } = parseCards(reading.cards, context.clock.now());
  const unopened = await unopenedFromPool(context, runId);
  const matches = matchPageCards(unopened, cards, limit);
  const ordered = [
    ...matches.filter(({ card, pooled }) => (card.id ?? pooled.id) === null),
    ...matches.filter(({ card, pooled }) => (card.id ?? pooled.id) !== null),
  ];
  const attempts: OpenAttempt[] = [];
  const verified: VerifiedOpening[] = [];
  let stoppedBecause: null | string = null;
  for (const match of ordered) {
    /* eslint-disable-next-line no-await-in-loop -- Each view is granted first. */
    const decision = await takeBudget(context, 'page-view');
    if (decision.status === 'refused') {
      stoppedBecause = decision.reason;
      attempts.push({
        company: match.card.company,
        outcome: 'budget-refused',
        title: match.card.title,
      });
      break;
    }
    /* eslint-disable-next-line no-await-in-loop -- One posting is open at a time. */
    const opening = await openPosting(
      driver,
      context.clock.sleep,
      match,
      new Set(verified.map(({ id }) => id)),
    );
    attempts.push({
      company: match.card.company,
      outcome: opening.outcome,
      title: match.card.title,
    });
    if (opening.outcome === 'opened') {
      verified.push({ detail: opening.detail, id: opening.id, pooled: match.pooled });
    } else if (opening.outcome === 'challenge' || opening.outcome === 'logged-out') {
      stoppedBecause = `The page turned into a ${opening.outcome} page: finish the run.`;
      break;
    }
  }
  const triaged =
    verified.length === 0
      ? null
      : await triageBatch(
          context,
          runId,
          'detail',
          verified.map(({ detail, id, pooled }) => detailCandidate(pooled, detail, id)),
        );
  const recordedIds = new Set(triaged?.survivors.map(({ id }) => id));
  await Promise.all(
    verified
      .filter(({ id }) => recordedIds.has(id))
      .map(({ detail, id }) => describePosting(context, id, detail.text)),
  );
  return {
    attempts,
    facts: Object.fromEntries(verified.map(({ detail, id }) => [id, factLinesOf(detail.text)])),
    matched: matches.length,
    onPage: cards.length,
    reason: stoppedBecause,
    status: stoppedBecause === null ? 'opened' : 'refused',
    triage: triaged === null ? null : omit(triaged, 'unreadable'),
    unopened: unopened.length,
  };
};
