import { pick } from 'lodash-es';

import { classifyApplyUrl } from '../discovery/apply-systems';
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

/**
 * Identifies a candidate in the triage result by what the browser pass read, since a result card
 * may carry no job identifier.
 */
export interface TriageSubject {
  readonly company: string;
  readonly id: null | string;
  readonly title: string;
}

export interface TriageDuplicate extends TriageSubject {
  /**
   * The ledger posting the candidate duplicates, by job identifier, or the earlier candidate in the
   * same batch, by job identifier or else by fingerprint.
   */
  readonly duplicateOf: string;
}

export interface TriageRejection extends TriageSubject {
  readonly reason: string;
}

export interface TriageResult {
  /**
   * The candidates already in the ledger, or repeated earlier in the same batch. They are neither
   * filtered nor recorded again.
   */
  readonly duplicates: TriageDuplicate[];
  /**
   * The postings to write to the ledger: every rejection that carries a job identifier and, at the
   * `detail` stage, every survivor. Survivors of the `card` stage are not recorded, because they
   * have not been read in full; rejections without an identifier cannot be, and are rejected again
   * from their result card on a later run at no cost.
   */
  readonly records: Posting[];
  readonly rejected: TriageRejection[];
  readonly survivors: Candidate[];
}

/**
 * The error raised when a candidate at the `detail` stage carries no job identifier, which the
 * opened posting always publishes.
 */
export class TriageInputError extends Error {}

const LinkedInJobViewUrl = 'https://www.linkedin.com/jobs/view/';

const subjectOf = (candidate: Candidate): TriageSubject =>
  pick(candidate, ['company', 'id', 'title']);

const toPosting = (
  candidate: { readonly id: string } & Candidate,
  { now, runId }: Pick<TriageInput, 'now' | 'runId'>,
  {
    filterReason,
    status,
  }: { readonly filterReason: null | string; readonly status: PostingStatus },
): Posting => ({
  ...pick(candidate, ['applyUrl', 'company', 'id', 'title']),
  application: null,
  applyVia:
    candidate.applyVia === 'unresolved' && candidate.applyUrl !== null
      ? classifyApplyUrl(candidate.applyUrl)
      : candidate.applyVia,
  filterReason,
  fingerprint: postingFingerprint(candidate),
  firstSeenAt: now.toISOString(),
  review: { decision: null, reason: null, reviewedAt: null },
  score: null,
  source: { ...candidate.source, run: runId },
  status,
  url: `${LinkedInJobViewUrl}${candidate.id}/`,
});

const hasId = (candidate: Candidate): candidate is { readonly id: string } & Candidate =>
  candidate.id !== null;

/**
 * Finds what a candidate duplicates: a posting already in the ledger or, failing that, a candidate
 * earlier in the same batch, matched by job identifier where both have one and otherwise by
 * fingerprint.
 */
const duplicateOf = (
  candidate: Candidate,
  index: number,
  { candidates, recorded }: Pick<TriageInput, 'candidates' | 'recorded'>,
): null | string => {
  const fingerprint = postingFingerprint(candidate);
  const earlier = candidates
    .slice(0, index)
    .find(
      other =>
        (candidate.id !== null && other.id === candidate.id) ||
        postingFingerprint(other) === fingerprint,
    );
  return (
    findDuplicate(recorded, { fingerprint, id: candidate.id })?.id ??
    (earlier === undefined ? null : (earlier.id ?? postingFingerprint(earlier)))
  );
};

/**
 * Triages a batch of candidate postings read in one browser pass: deduplicates them against the
 * ledger and against each other, then applies the hard filters to those that are new.
 *
 * @param {TriageInput} input
 *   The candidates, the ledger, the preferences, and the pass the candidates came from.
 *
 * @throws {TriageInputError} If a candidate at the `detail` stage carries no job identifier.
 *
 * @returns {TriageResult} The outcome for every candidate, and the postings to record.
 */
export const triageCandidates = (input: TriageInput): TriageResult => {
  if (input.stage === 'detail' && !input.candidates.every(hasId)) {
    throw new TriageInputError(
      'Every candidate at the detail stage must carry the job identifier of the opened posting.',
    );
  }
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
      duplicate === null ? [] : [{ ...subjectOf(candidate), duplicateOf: duplicate }],
    ),
    records: [
      ...rejected.flatMap(({ candidate, reason }) =>
        hasId(candidate)
          ? [toPosting(candidate, input, { filterReason: reason, status: 'filtered' })]
          : [],
      ),
      ...(input.stage === 'detail'
        ? survivors
            .filter(hasId)
            .map(candidate =>
              toPosting(candidate, input, { filterReason: null, status: 'pending' }),
            )
        : []),
    ],
    rejected: rejected.map(({ candidate, reason }) => ({ ...subjectOf(candidate), reason })),
    survivors,
  };
};
