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
 * Every fact other than the identity of the posting is nullable, because a result card publishes
 * only some of them and a full posting does not always publish all of them either. A `null` is
 * deferred at the `card` stage and decided by the configured policy at the `detail` stage. In
 * particular, `sponsorshipOffered` is `false` only when the posting says it offers no sponsorship.
 */
export const CandidateSchema = z
  .object({
    applyVia: z.enum(ApplicationSystems),
    company: TextSchema,
    companySize: z.enum(CompanySizeBands).nullable(),
    compensation: CompensationSchema.nullable(),
    id: z.string().regex(LinkedInJobIdPattern),
    location: TextSchema.nullable(),
    postedAt: TimestampSchema.nullable(),
    source: CandidateSourceSchema,
    sponsorshipOffered: z.boolean().nullable(),
    title: TextSchema,
    url: z
      .string()
      .url()
      .refine(url => url.startsWith('https://www.linkedin.com/jobs/view/'), {
        message: 'A posting URL must be a LinkedIn job view.',
      }),
    workplace: z.enum(Workplaces).nullable(),
  })
  .strict();

export type Candidate = z.infer<typeof CandidateSchema>;

export const CandidatesSchema = z.array(CandidateSchema);
