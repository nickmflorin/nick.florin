import { z } from 'zod';

import { TextSchema, TimestampSchema } from './common';

/**
 * The answer given to a voluntary self-identification question, which is declined unless an answer
 * has been configured deliberately.
 */
const SelfIdentificationSchema = TextSchema.default('decline');

/**
 * When Nick can start, as a span from the day an application is filled.
 */
export const StartOffsets = [
  'immediately',
  '1 week',
  '2 weeks',
  '3 weeks',
  '1 month',
  '2 months',
  '3 months',
] as const;

/**
 * When Nick can start: a span from the day an application is filled, or a fixed date. A form's
 * date field takes the date it works out to; a question asking when he can start takes the phrase.
 */
const StartSchema = z.union([
  z.enum(StartOffsets),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'A start date is written as YYYY-MM-DD.'),
]);

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
 * `contact.city` and `contact.region` are where Nick says he is located; `contact.address` is the
 * full mailing address a form asking for one is given, which may lie elsewhere — `null` until it
 * is configured.
 *
 * Whether sponsorship is required is not repeated here; the hard filter of the same name in
 * `preferences.yaml` is the single source for it.
 */
export const AnswersSchema = z
  .object({
    availability: z
      .object({ start: StartSchema.default('immediately') })
      .strict()
      .default({}),
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
        address: z
          .object({
            city: TextSchema,
            postalCode: TextSchema,
            region: TextSchema,
            street: TextSchema,
          })
          .strict()
          .nullable()
          .default(null),
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
