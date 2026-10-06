import { statusForScore } from '../postings';
import { type Posting, type PostingSource, type Preferences } from '../schemas';

/**
 * How many postings a source must have recorded, none of them scoring into the queue, before it is
 * proposed for retirement: enough that the absence is the search's and not chance's.
 */
export const BarrenAfter = 10;

const MillisecondsPerDay = 24 * 60 * 60 * 1000;

/**
 * What one source of postings — the recommendations, or a saved search — has yielded: the postings
 * it led to that were recorded, how many have been scored, and how many of those scored into the
 * queue. A search that keeps leading to postings that never reach the queue is barren.
 */
export interface SourceYield {
  readonly barren: boolean;
  readonly found: number;
  readonly queued: number;
  readonly scored: number;
  readonly source: string;
}

/**
 * A posting Nick skipped in review, with the reason he gave, for proposing preference edits.
 */
export interface SkipReason {
  readonly company: string;
  readonly reason: string;
  readonly title: string;
}

export interface LearningReport {
  readonly skips: SkipReason[];
  readonly sources: SourceYield[];
}

const sourceName = (source: PostingSource): string =>
  source.kind === 'search' ? source.search : 'recommendations';

/**
 * Builds the learning report over the postings first seen within a window: each source's yield,
 * most productive first, and the reasons Nick gave for the postings he skipped.
 *
 * A posting counts as reaching the queue by its score, whatever became of it after, so that a
 * search is judged by what it finds rather than by what was later applied to.
 *
 * @param {readonly Posting[]} postings Every posting in the ledger.
 * @param {object} options The scoring thresholds, the time, and how many days back to look.
 *
 * @returns {LearningReport} The yields and the skip reasons.
 */
export const buildLearningReport = (
  postings: readonly Posting[],
  {
    days,
    now,
    scoring,
  }: { readonly days: number; readonly now: Date; readonly scoring: Preferences['scoring'] },
): LearningReport => {
  const since = now.getTime() - days * MillisecondsPerDay;
  const recent = postings.filter(({ firstSeenAt }) => new Date(firstSeenAt).getTime() >= since);
  const names = [...new Set(recent.map(({ source }) => sourceName(source)))];
  return {
    skips: recent.flatMap(({ company, review, title }) =>
      review.decision === 'skipped' && review.reason !== null
        ? [{ company, reason: review.reason, title }]
        : [],
    ),
    sources: names
      .map(name => {
        const found = recent.filter(({ source }) => sourceName(source) === name);
        const queued = found.filter(
          ({ score }) => score !== null && statusForScore(score, scoring) === 'queued',
        ).length;
        return {
          barren: found.length >= BarrenAfter && queued === 0,
          found: found.length,
          queued,
          scored: found.filter(({ score }) => score !== null).length,
          source: name,
        };
      })
      .sort((a, b) => b.queued - a.queued || b.found - a.found),
  };
};
