import { z } from 'zod';

import { TextSchema, TimestampSchema } from './common';

/**
 * The answer given to a voluntary self-identification question, which is declined unless an answer
 * has been configured deliberately.
 */
const SelfIdentificationSchema = TextSchema.default('decline');

/**
 * An answer to a form question that none of the structured fields cover.
 *
 * These accumulate over time: a question that cannot be answered from this file halts its
 * application, and the answer given when the question is put to the human is recorded here so that
 * the same question is never asked twice.
 */
const CustomAnswerSchema = z
  .object({ addedAt: TimestampSchema, answer: TextSchema, question: TextSchema })
  .strict();

/**
 * The shape of `answers.yaml` in the job-search data directory: the canned answers that application
 * forms are filled from, so that no answer is ever composed by a model.
 *
 * Whether sponsorship is required is not repeated here; the hard filter of the same name in
 * `preferences.yaml` is the single source for it.
 */
export const AnswersSchema = z
  .object({
    availability: z.object({ noticePeriodWeeks: z.number().int().nonnegative() }).strict(),
    compensation: z
      .object({
        currency: z
          .string()
          .regex(/^[A-Z]{3}$/)
          .default('USD'),
        target: z.number().int().positive(),
      })
      .strict(),
    contact: z
      .object({
        city: TextSchema,
        country: TextSchema,
        email: z.string().email(),
        phone: TextSchema,
        region: TextSchema,
      })
      .strict(),
    custom: z.array(CustomAnswerSchema).default([]),
    links: z
      .object({
        github: z.string().url().optional(),
        linkedin: z.string().url(),
        website: z.string().url().optional(),
      })
      .strict(),
    selfIdentification: z
      .object({
        disability: SelfIdentificationSchema,
        ethnicity: SelfIdentificationSchema,
        gender: SelfIdentificationSchema,
        veteranStatus: SelfIdentificationSchema,
      })
      .strict()
      .default({}),
    workAuthorization: z
      .object({ authorizedCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1) })
      .strict(),
  })
  .strict();

export type Answers = z.infer<typeof AnswersSchema>;
