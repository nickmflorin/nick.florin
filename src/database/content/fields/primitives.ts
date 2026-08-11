import { z } from 'zod';

import { SyndicationChannel } from '~/database/model';

import { type FieldCodec } from './field-codec';

const CalendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const CalendarDateSchema = z
  .string()
  .regex(CalendarDatePattern, 'Expected a calendar date in YYYY-MM-DD form.')
  .refine(value => !Number.isNaN(Date.parse(value)), 'Expected a real calendar date.');

const SyndicationChannelsSchema = z
  .array(z.nativeEnum(SyndicationChannel))
  .refine(values => new Set(values).size === values.length, 'A channel cannot be listed twice.');

const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const stringField = (): FieldCodec<string, string> => ({
  decode: value => value,
  encode: value => value,
  schema: z.string().min(1),
});

export const nullableStringField = (): FieldCodec<string | undefined, null | string> => ({
  decode: value => value ?? null,
  encode: value => value ?? undefined,
  schema: z.string().min(1).optional(),
});

export const nullableIntField = (): FieldCodec<number | undefined, null | number> => ({
  decode: value => value ?? null,
  encode: value => value ?? undefined,
  schema: z.number().int().optional(),
});

/**
 * A boolean whose default is `false`: only an affirmative `true` is written to the fixture.
 */
export const flagField = (): FieldCodec<boolean | undefined, boolean> => ({
  decode: value => value ?? false,
  encode: value => (value ? true : undefined),
  schema: z.boolean().optional(),
});

/**
 * The `isVisible` flag, whose default is `true`: only an explicit `false` is written to the
 * fixture.
 */
export const visibilityField = (): FieldCodec<boolean | undefined, boolean> => ({
  decode: value => value ?? true,
  encode: value => (value === false ? false : undefined),
  schema: z.boolean().optional(),
});

/**
 * A calendar date, stored in the fixture as a `YYYY-MM-DD` string and canonically as a `Date` at
 * UTC midnight.
 */
export const dateField = (): FieldCodec<string, Date> => ({
  decode: value => new Date(`${value}T00:00:00.000Z`),
  encode: value => value.toISOString().slice(0, 10),
  schema: CalendarDateSchema,
});

export const nullableDateField = (): FieldCodec<string | undefined, Date | null> => ({
  decode: value => (value === undefined ? null : new Date(`${value}T00:00:00.000Z`)),
  encode: value => (value === null ? undefined : value.toISOString().slice(0, 10)),
  schema: CalendarDateSchema.optional(),
});

export const enumField = <E extends z.EnumLike>(values: E): FieldCodec<E[keyof E], E[keyof E]> => ({
  decode: value => value,
  encode: value => value,
  schema: z.nativeEnum(values),
});

export const nullableEnumField = <E extends z.EnumLike>(
  values: E,
): FieldCodec<E[keyof E] | undefined, E[keyof E] | null> => ({
  decode: value => value ?? null,
  encode: value => value ?? undefined,
  schema: z.nativeEnum(values).optional(),
});

/**
 * The `channels` allowlist. Omitted decodes to the empty list, which — per the 2026-08-11
 * inversion — means the record syndicates NOWHERE until channels are granted. On content-tree
 * nodes an empty list additionally reads as "inherit the parent's channels" and is resolved by
 * `stampContentTreeChannels`; a node that should truly render nowhere authors `isVisible: false`.
 */
export const channelsField = (): FieldCodec<
  SyndicationChannel[] | undefined,
  SyndicationChannel[]
> => ({
  decode: value => value ?? [],
  encode: value => (value.length > 0 ? [...value] : undefined),
  schema: SyndicationChannelsSchema.optional(),
});

/**
 * An entity's own slug: optional in the fixture, because a binding derives a missing one from the
 * record's natural name at parse time. Derivation is deterministic, so every fixture consumer —
 * the sync push or a fixture-only generation run — sees the same slug; serialization writes the
 * derived value back, making it sticky thereafter.
 */
export const slugField = (): FieldCodec<string | undefined, null | string> => ({
  decode: value => value ?? null,
  encode: value => value ?? undefined,
  schema: z.string().min(1).optional(),
});

/**
 * A required slug reference to a record of another entity. The referenced entity's key is carried
 * on the codec so that cross-reference validation can verify the slug resolves.
 */
export const slugRefField = (entity: string): FieldCodec<string, string> => ({
  decode: value => value,
  encode: value => value,
  references: entity,
  schema: z.string().min(1),
});

export const slugRefListField = (entity: string): FieldCodec<string[] | undefined, string[]> => ({
  decode: value => value ?? [],
  encode: value => (value.length > 0 ? [...value] : undefined),
  references: entity,
  schema: z.array(z.string().min(1)).optional(),
});

/**
 * Human-authored prose (plain text or inline HTML). Decoding collapses internal whitespace so
 * that fixture formatting — folded YAML scalars, wrapped lines — never becomes part of the value.
 */
export const proseField = (): FieldCodec<string, string> => ({
  decode: value => collapseWhitespace(value),
  encode: value => value,
  schema: z.string().min(1),
});

export const nullableProseField = (): FieldCodec<string | undefined, null | string> => ({
  decode: value => (value === undefined ? null : collapseWhitespace(value)),
  encode: value => value ?? undefined,
  schema: z.string().min(1).optional(),
});
