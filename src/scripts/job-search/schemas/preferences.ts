import { z } from 'zod';

import { ScoreSchema, TermsSchema, TextSchema } from './common';

/**
 * The employee-count bands that LinkedIn publishes on every company page, which the company-size
 * hard filter matches against.
 */
export const CompanySizeBands = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10001+',
] as const;

export type CompanySizeBand = (typeof CompanySizeBands)[number];

export const CompanyStages = ['early-stage', 'growth', 'late-stage', 'public'] as const;

export type CompanyStage = (typeof CompanyStages)[number];

/**
 * Whether a search was generated from the profile by the setup or the learning loop, or added by
 * hand. Only generated searches are retired automatically when their yield stays barren.
 */
export const SearchOrigins = ['generated', 'manual'] as const;

export type SearchOrigin = (typeof SearchOrigins)[number];

/**
 * What a hard filter does with a posting that does not publish the value it filters on, such as a
 * posting with no compensation range or a company with no published size.
 */
export const UnlistedPolicies = ['pass', 'reject'] as const;

export type UnlistedPolicy = (typeof UnlistedPolicies)[number];

export const Workplaces = ['hybrid', 'onsite', 'remote'] as const;

export type Workplace = (typeof Workplaces)[number];

/**
 * The prefix every search URL carries, so that a search cannot point the browser anywhere other
 * than LinkedIn's job search.
 */
export const LinkedInJobSearchUrl = 'https://www.linkedin.com/jobs/search/';

const SearchNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The filters applied deterministically, before any model call. A posting that fails one is
 * rejected outright and recorded in the ledger with the reason.
 *
 * The current employer is a required field of its own, always treated as blocked in addition to the
 * block list, so that it can never be forgotten. It is never derived from the career content, which
 * is public.
 */
const HardFiltersSchema = z
  .object({
    companies: z
      .object({
        block: TermsSchema,
        currentEmployer: TextSchema,
      })
      .strict(),
    companySize: z
      .object({
        bands: z
          .array(z.enum(CompanySizeBands))
          .min(1)
          .default([...CompanySizeBands]),
        whenUnknown: z.enum(UnlistedPolicies).default('pass'),
      })
      .strict()
      .default({}),
    compensation: z
      .object({
        currency: z
          .string()
          .regex(/^[A-Z]{3}$/)
          .default('USD'),
        floor: z.number().int().nonnegative(),
        whenUnlisted: z.enum(UnlistedPolicies).default('pass'),
      })
      .strict(),
    locations: TermsSchema,
    postedWithinDays: z.number().int().positive().default(14),
    sponsorshipRequired: z.boolean(),
    titles: z
      .object({
        exclude: TermsSchema,
        include: z.array(TextSchema).min(1),
      })
      .strict(),
    workplace: z.array(z.enum(Workplaces)).min(1),
  })
  .strict();

/**
 * The signals the scoring agent weighs, as opposed to filtering on them.
 */
const SoftSignalsSchema = z
  .object({
    companies: z
      .object({
        prefer: TermsSchema,
        stages: z.array(z.enum(CompanyStages)).default([]),
      })
      .strict()
      .default({}),
    domains: z.object({ avoid: TermsSchema, prefer: TermsSchema }).strict().default({}),
    notes: z.string().default(''),
    stack: z
      .object({ avoid: TermsSchema, preferred: TermsSchema, required: TermsSchema })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const ScoringSchema = z
  .object({ maybeAt: ScoreSchema.default(50), queueAt: ScoreSchema.default(70) })
  .strict()
  .default({})
  .refine(({ maybeAt, queueAt }) => maybeAt < queueAt, {
    message: 'The maybe threshold must sit below the queue threshold.',
    path: ['maybeAt'],
  });

const CoverLettersSchema = z
  .object({ optionalAt: ScoreSchema.default(80) })
  .strict()
  .default({});

/**
 * The bounds on LinkedIn activity. The cli enforces them before every page load; the learning loop
 * may propose lowering one, but never raising it.
 */
const LimitsSchema = z
  .object({
    cooldownHoursAfterChallenge: z.number().int().positive().default(48),
    delaySeconds: z
      .tuple([z.number().positive(), z.number().positive()])
      .default([5, 15])
      .refine(([minimum, maximum]) => minimum <= maximum, {
        message: 'The minimum delay must not exceed the maximum delay.',
      }),
    easyApplyFillsPerDay: z.number().int().positive().default(15),
    linkedinPageViewsPerDay: z.number().int().positive().default(120),
    runsPerDay: z.number().int().positive().default(2),
  })
  .strict()
  .default({});

const SearchSchema = z
  .object({
    name: z.string().regex(SearchNamePattern),
    origin: z.enum(SearchOrigins),
    url: z
      .string()
      .url()
      .refine(url => url.startsWith(LinkedInJobSearchUrl), {
        message: `A search URL must begin with '${LinkedInJobSearchUrl}'.`,
      }),
  })
  .strict();

const SearchesSchema = z
  .array(SearchSchema)
  .default([])
  .superRefine((searches, context) => {
    searches.forEach((search, index) => {
      if (searches.findIndex(other => other.name === search.name) !== index) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The search name '${search.name}' is used more than once.`,
          path: [index, 'name'],
        });
      }
    });
  });

/**
 * The shape of `preferences.yaml` in the job-search data directory.
 *
 * Fields with a default are never asked for: the setup asks only for the fields this schema reports
 * as missing, which are the personal constraints that the career content cannot reveal and the
 * search terms the setup derives from it.
 */
export const PreferencesSchema = z
  .object({
    coverLetters: CoverLettersSchema,
    hard: HardFiltersSchema,
    limits: LimitsSchema,
    scoring: ScoringSchema,
    searches: SearchesSchema,
    soft: SoftSignalsSchema,
  })
  .strict();

export type Preferences = z.infer<typeof PreferencesSchema>;
