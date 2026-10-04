import { z } from 'zod';

import { LinkedInJobIdPattern, TextSchema, TimestampSchema } from './common';
import { ApplicationSystems } from './ledger';
import { CompanySizeBands, Workplaces } from './preferences';

/**
 * The two passes in which postings are read. The `card` pass reads LinkedIn's result cards, which
 * publish only some of a posting's facts; the `detail` pass reads the full posting.
 */
export const TriageStages = ['card', 'detail'] as const;

export type TriageStage = (typeof TriageStages)[number];

const CompensationSchema = z
  .object({
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default('USD'),
    maximum: z.number().int().positive().nullable(),
    minimum: z.number().int().positive().nullable(),
  })
  .strict()
  .refine(({ maximum, minimum }) => maximum !== null || minimum !== null, {
    message: 'A compensation range must have at least one bound.',
  })
  .refine(({ maximum, minimum }) => maximum === null || minimum === null || minimum <= maximum, {
    message: 'The minimum compensation must not exceed the maximum.',
  });

/**
 * Where a candidate was found. The run it was found in is supplied by the command that records it,
 * not by the browser pass that read it.
 */
const CandidateSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('recommendations') }).strict(),
  z.object({ kind: z.literal('search'), search: TextSchema }).strict(),
]);

/**
 * A posting as the browser pass read it from LinkedIn, before it has been triaged.
 *
 * Every fact other than the company and title is nullable, because a result card publishes only
 * some of them and a full posting does not always publish all of them either. A `null` is deferred
 * at the `card` stage and decided by the configured policy at the `detail` stage. In particular,
 * `sponsorshipOffered` is `false` only when the posting says it offers no sponsorship.
 *
 * The LinkedIn job identifier is among the facts a result card may not publish — LinkedIn's search
 * results expose it only once a card is opened — so it is required only at the `detail` stage. The
 * `applyUrl` is the external "Apply" link, from which the applicant tracking system is identified
 * when `applyVia` is `unresolved`.
 */
export const CandidateSchema = z
  .object({
    applyUrl: z.string().url().nullable(),
    applyVia: z.enum(ApplicationSystems),
    company: TextSchema,
    companySize: z.enum(CompanySizeBands).nullable(),
    compensation: CompensationSchema.nullable(),
    id: z.string().regex(LinkedInJobIdPattern).nullable(),
    location: TextSchema.nullable(),
    postedAt: TimestampSchema.nullable(),
    source: CandidateSourceSchema,
    sponsorshipOffered: z.boolean().nullable(),
    title: TextSchema,
    workplace: z.enum(Workplaces).nullable(),
  })
  .strict();

export type Candidate = z.infer<typeof CandidateSchema>;

export const CandidatesSchema = z.array(CandidateSchema);
