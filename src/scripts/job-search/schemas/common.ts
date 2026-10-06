import { z } from 'zod';

/**
 * A calendar date in the machine's local time zone, of the form `2026-10-03`.
 *
 * Daily limits and run identifiers are keyed by the local date rather than the UTC one, so that a
 * run in the evening counts against the day it happened on rather than the next.
 */
export const LocalDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A run identifier: the local date the run started on, and its ordinal within that day.
 */
export const RunIdPattern = /^\d{4}-\d{2}-\d{2}-\d+$/;

/**
 * A LinkedIn job identifier, the numeric segment of a `linkedin.com/jobs/view/{id}` URL. It is kept
 * as a string because it names files and is never used in arithmetic.
 */
export const LinkedInJobIdPattern = /^\d+$/;

export const CountSchema = z.number().int().nonnegative();

export const LocalDateSchema = z.string().regex(LocalDatePattern);

export const RunIdSchema = z.string().regex(RunIdPattern);

/**
 * A fit score, or a fit threshold, on the scoring agent's scale of 0 to 100.
 */
export const ScoreSchema = z.number().int().min(0).max(100);

export const TextSchema = z.string().trim().min(1);

/**
 * A list of free-text terms — titles, company names, technologies, domains — that defaults to
 * empty when omitted.
 */
export const TermsSchema = z.array(TextSchema).default([]);

export const TimestampSchema = z.string().datetime();

/**
 * A compensation range as a posting states it, in whole units of its currency, with at least one
 * bound.
 */
export const CompensationSchema = z
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
