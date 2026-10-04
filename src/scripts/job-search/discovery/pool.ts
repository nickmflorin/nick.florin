import path from 'node:path';

import { z } from 'zod';

import { postingFingerprint } from '../ledger/fingerprint';
import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { type Candidate, CandidateSchema, type Preferences } from '../schemas';
import { type SessionContext } from '../session';

import { AccountRequirements } from './apply-systems';

/**
 * The directory, inside the job-search data directory, that holds each run's pool of card-stage
 * survivors.
 */
export const PoolDirectoryName = 'pools';

/**
 * A run's pool: every card-stage survivor across the run's sources, once each by company and title,
 * from which the most promising are opened.
 */
const PoolSchema = z.object({ candidates: z.array(CandidateSchema), run: z.string() }).strict();

const poolFileFor = (dataDirectory: string, run: string): string =>
  path.join(dataDirectory, PoolDirectoryName, `${run}.yaml`);

/**
 * Adds card-stage survivors to a run's pool, skipping any whose company and title the pool already
 * holds, since the same posting surfaces in several searches.
 *
 * @param {SessionContext} context The data directory.
 * @param {string} run The identifier of the run.
 * @param {readonly Candidate[]} survivors The card-stage survivors of one source.
 *
 * @returns {Promise<number>} The number of candidates the pool now holds.
 */
export const addToPool = async (
  { dataDirectory }: SessionContext,
  run: string,
  survivors: readonly Candidate[],
): Promise<number> => {
  const file = poolFileFor(dataDirectory, run);
  const pooled = (await readYamlRecord(file, PoolSchema))?.candidates ?? [];
  const fingerprints = new Set(pooled.map(postingFingerprint));
  const candidates = [
    ...pooled,
    ...survivors.filter(
      (candidate, index) =>
        !fingerprints.has(postingFingerprint(candidate)) &&
        survivors.findIndex(
          other => postingFingerprint(other) === postingFingerprint(candidate),
        ) === index,
    ),
  ];
  await writeYamlRecord(file, { candidates, run }, PoolSchema);
  return candidates.length;
};

/**
 * Where a candidate's listed pay stands against the floor: at or above it, unlisted, or below it.
 * A card rarely lists pay, so unlisted is the common case, and a listing at the floor is the
 * strongest signal a card gives.
 */
const compensationRank = (
  { compensation }: Candidate,
  floor: Preferences['hard']['compensation']['floor'],
): number => {
  const top = compensation === null ? null : (compensation.maximum ?? compensation.minimum);
  if (top === null) {
    return 1;
  }
  return top >= floor ? 0 : 2;
};

/**
 * How directly a candidate can be applied to: through a form that needs no account, through one
 * whose need is unknown, or through one that needs an account Nick must approve.
 */
const applyRank = ({ applyVia }: Candidate): number => {
  switch (AccountRequirements[applyVia]) {
    case 'no':
      return 0;
    case 'unknown':
      return 1;
    case 'yes':
      return 2;
  }
};

/**
 * Orders a pool's candidates by promise: listed pay at or above the floor first, then those whose
 * application needs no account, then the most recently posted.
 *
 * @param {readonly Candidate[]} candidates The pooled candidates.
 * @param {Preferences} preferences The preferences, for the compensation floor.
 *
 * @returns {Candidate[]} The candidates, most promising first.
 */
export const rankCandidates = (
  candidates: readonly Candidate[],
  { hard }: Preferences,
): Candidate[] =>
  [...candidates].sort(
    (a, b) =>
      compensationRank(a, hard.compensation.floor) - compensationRank(b, hard.compensation.floor) ||
      applyRank(a) - applyRank(b) ||
      (b.postedAt ?? '').localeCompare(a.postedAt ?? ''),
  );

/**
 * Lists the most promising candidates in a run's pool that have not been opened yet — those whose
 * company and title the ledger does not hold — up to a cap.
 *
 * @param {SessionContext} context The ledger, the preferences and the data directory.
 * @param {string} run The identifier of the run.
 * @param {number} cap How many candidates to return at most.
 *
 * @returns {Promise<{ readonly candidates: Candidate[]; readonly remaining: number }>}
 *   The candidates to open next, and how many unopened candidates the pool holds beyond them.
 */
export const nextFromPool = async (
  context: SessionContext,
  run: string,
  cap: number,
): Promise<{ readonly candidates: Candidate[]; readonly remaining: number }> => {
  const [pool, recorded] = await Promise.all([
    readYamlRecord(poolFileFor(context.dataDirectory, run), PoolSchema),
    context.store.listPostings(),
  ]);
  const opened = new Set(recorded.records.map(({ fingerprint }) => fingerprint));
  const unopened = rankCandidates(
    (pool?.candidates ?? []).filter(candidate => !opened.has(postingFingerprint(candidate))),
    context.preferences,
  );
  return { candidates: unopened.slice(0, cap), remaining: Math.max(0, unopened.length - cap) };
};
