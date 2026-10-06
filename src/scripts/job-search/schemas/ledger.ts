import { z } from 'zod';

import {
  CompensationSchema,
  CountSchema,
  LinkedInJobIdPattern,
  LocalDateSchema,
  RunIdSchema,
  ScoreSchema,
  TextSchema,
  TimestampSchema,
} from './common';

/**
 * How a posting is applied to: inside LinkedIn through Easy Apply, through an employer's applicant
 * tracking system, or `unresolved` while the result-card pass has seen only that the posting leaves
 * LinkedIn, before its redirect has been followed.
 */
export const ApplicationSystems = [
  'ashby',
  'easy-apply',
  'greenhouse',
  'lever',
  'other',
  'unresolved',
  'workday',
] as const;

export type ApplicationSystem = (typeof ApplicationSystems)[number];

/**
 * Where a posting stands. `filtered` failed a hard filter and `dropped` scored below the maybe
 * threshold or hit a dealbreaker; both are kept so that the filters and thresholds can be tuned
 * against what they rejected. `pending` passed every hard filter and awaits its score.
 */
export const PostingStatuses = [
  'dropped',
  'filled',
  'filtered',
  'maybe',
  'pending',
  'queued',
  'skipped',
  'submitted',
] as const;

export type PostingStatus = (typeof PostingStatuses)[number];

export const ReviewDecisions = ['approved', 'skipped'] as const;

/**
 * Who submitted an application: Nick, or the agent under the `verified` submit policy.
 */
export const Submitters = ['agent', 'nick'] as const;

export type Submitter = (typeof Submitters)[number];

export type ReviewDecision = (typeof ReviewDecisions)[number];

/**
 * Why a run ended. Every ending other than `completed` and `aborted` stops the run on a guard: the
 * daily budget, a security challenge, or a lost LinkedIn session.
 */
export const RunEndings = ['aborted', 'budget', 'challenge', 'completed', 'logged-out'] as const;

export type RunEnding = (typeof RunEndings)[number];

export const PostingScoreSchema = z
  .object({
    dealbreakers: z.array(TextSchema),
    dimensions: z
      .object({
        company: ScoreSchema,
        domain: ScoreSchema,
        notes: ScoreSchema,
        seniority: ScoreSchema,
        stack: ScoreSchema,
      })
      .strict(),
    flags: z.array(TextSchema),
    gaps: z.array(TextSchema),
    rationale: TextSchema,
    total: ScoreSchema,
  })
  .strict();

export type PostingScore = z.infer<typeof PostingScoreSchema>;

const PostingSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('recommendations'), run: RunIdSchema }).strict(),
  z.object({ kind: z.literal('search'), run: RunIdSchema, search: TextSchema }).strict(),
]);

export type PostingSource = z.infer<typeof PostingSourceSchema>;

/**
 * The shape of a posting file, `ledger/postings/{id}.yaml`: one per LinkedIn posting ever seen,
 * whatever became of it.
 */
export const PostingSchema = z
  .object({
    application: z
      .object({
        resumeSha256: z.string().regex(/^[a-f0-9]{64}$/),
        submittedAt: TimestampSchema.nullable(),
        submittedBy: z.enum(Submitters).nullable().default(null),
      })
      .strict()
      .nullable(),
    applyUrl: z.string().url().nullable().default(null),
    applyVia: z.enum(ApplicationSystems),
    company: TextSchema,
    compensation: CompensationSchema.nullable().default(null),
    description: z.string().nullable().default(null),
    filterReason: TextSchema.nullable(),
    fingerprint: TextSchema,
    firstSeenAt: TimestampSchema,
    id: z.string().regex(LinkedInJobIdPattern),
    review: z
      .object({
        decision: z.enum(ReviewDecisions).nullable(),
        reason: TextSchema.nullable(),
        reviewedAt: TimestampSchema.nullable(),
      })
      .strict(),
    score: PostingScoreSchema.nullable(),
    source: PostingSourceSchema,
    status: z.enum(PostingStatuses),
    title: TextSchema,
    url: z.string().url(),
  })
  .strict();

export type Posting = z.infer<typeof PostingSchema>;

/**
 * How many postings a source surfaced in one run, and how many of those scored into the review
 * queue. The ratio is the source's yield, which decides whether a generated search is kept.
 */
const YieldSchema = z.object({ found: CountSchema, queued: CountSchema }).strict();

/**
 * The shape of a run file, `ledger/runs/{id}.yaml`.
 *
 * A run records its run-only adjustments to the saved preferences as given, so that every posting
 * it produced can be traced to the preferences in force when the posting was scored.
 */
export const RunSchema = z
  .object({
    endedBy: z.enum(RunEndings).nullable(),
    finishedAt: TimestampSchema.nullable(),
    id: RunIdSchema,
    overrides: z.array(TextSchema),
    recommendations: YieldSchema,
    searches: z.array(YieldSchema.extend({ name: TextSchema })),
    startedAt: TimestampSchema,
  })
  .strict();

export type Run = z.infer<typeof RunSchema>;

/**
 * The shape of a budget file, `ledger/budget/{date}.yaml`: the day's LinkedIn activity, counted
 * against the limits in `preferences.yaml`.
 */
export const BudgetSchema = z
  .object({
    date: LocalDateSchema,
    easyApplyFills: CountSchema,
    lastPageViewAt: TimestampSchema.nullable(),
    pageViews: CountSchema,
    runs: CountSchema,
  })
  .strict();

export type Budget = z.infer<typeof BudgetSchema>;

/**
 * The shape of `ledger/cooldown.yaml`, present only while LinkedIn runs are suspended after a
 * security challenge.
 */
export const CooldownSchema = z
  .object({ reason: TextSchema, startedAt: TimestampSchema, until: TimestampSchema })
  .strict();

export type Cooldown = z.infer<typeof CooldownSchema>;
