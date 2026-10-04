import { pick } from 'lodash-es';

import { findDuplicate, postingFingerprint } from '../ledger/fingerprint';
import { type Candidate, type Posting, type PostingStatus, type Preferences } from '../schemas';

import { applyHardFilters, type HardFilterContext } from './hard-filters';

export interface TriageInput extends HardFilterContext {
  readonly candidates: readonly Candidate[];
  readonly preferences: Preferences;
  /**
   * Every posting already in the ledger, against which the candidates are deduplicated.
   */
  readonly recorded: readonly Posting[];
  readonly runId: string;
}

export interface TriageDuplicate {
  readonly duplicateOf: string;
  readonly id: string;
}

export interface TriageRejection {
  readonly id: string;
  readonly reason: string;
}

export interface TriageResult {
  /**
   * The candidates already in the ledger, or repeated earlier in the same batch, with the posting
   * each one duplicates. They are neither filtered nor recorded again.
   */
  readonly duplicates: TriageDuplicate[];
  /**
   * The postings to write to the ledger: every rejection and, at the `detail` stage, every
   * survivor.
   * Survivors of the `card` stage are not recorded, because they have not been read in full.
   */
  readonly records: Posting[];
  readonly rejected: TriageRejection[];
  readonly survivors: Candidate[];
}

const toPosting = (
  candidate: Candidate,
  { now, runId }: Pick<TriageInput, 'now' | 'runId'>,
  {
    filterReason,
    status,
  }: { readonly filterReason: null | string; readonly status: PostingStatus },
): Posting => ({
  ...pick(candidate, ['applyVia', 'company', 'id', 'title', 'url']),
  application: null,
  filterReason,
  fingerprint: postingFingerprint(candidate),
  firstSeenAt: now.toISOString(),
  review: { decision: null, reason: null, reviewedAt: null },
  score: null,
  source: { ...candidate.source, run: runId },
  status,
});

/**
 * Finds what a candidate duplicates: a posting already in the ledger or, failing that, a candidate
 * earlier in the same batch, matched by job identifier and then by fingerprint.
 */
const duplicateOf = (
  candidate: Candidate,
  index: number,
  { candidates, recorded }: Pick<TriageInput, 'candidates' | 'recorded'>,
): null | string => {
  const fingerprint = postingFingerprint(candidate);
  const earlier = candidates
    .slice(0, index)
    .find(other => other.id === candidate.id || postingFingerprint(other) === fingerprint);
  return findDuplicate(recorded, { fingerprint, id: candidate.id })?.id ?? earlier?.id ?? null;
};

/**
 * Triages a batch of candidate postings read in one browser pass: deduplicates them against the
 * ledger and against each other, then applies the hard filters to those that are new.
 *
 * @param {TriageInput} input
 *   The candidates, the ledger, the preferences, and the pass the candidates came from.
 *
 * @returns {TriageResult} The outcome for every candidate, and the postings to record.
 */
export const triageCandidates = (input: TriageInput): TriageResult => {
  const decided = input.candidates.map((candidate, index) => ({
    candidate,
    duplicate: duplicateOf(candidate, index, input),
    reason: applyHardFilters(candidate, input.preferences.hard, input),
  }));
  const fresh = decided.filter(({ duplicate }) => duplicate === null);
  const rejected = fresh.flatMap(({ candidate, reason }) =>
    reason === null ? [] : [{ candidate, reason }],
  );
  const survivors = fresh.flatMap(({ candidate, reason }) => (reason === null ? [candidate] : []));
  return {
    duplicates: decided.flatMap(({ candidate, duplicate }) =>
      duplicate === null ? [] : [{ duplicateOf: duplicate, id: candidate.id }],
    ),
    records: [
      ...rejected.map(({ candidate, reason }) =>
        toPosting(candidate, input, { filterReason: reason, status: 'filtered' }),
      ),
      ...(input.stage === 'detail'
        ? survivors.map(candidate =>
            toPosting(candidate, input, { filterReason: null, status: 'pending' }),
          )
        : []),
    ],
    rejected: rejected.map(({ candidate, reason }) => ({ id: candidate.id, reason })),
    survivors,
  };
};
