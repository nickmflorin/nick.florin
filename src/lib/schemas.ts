import { z } from 'zod';

import { logger } from '~/internal/logger';
import { isRecordType } from '~/lib/typeguards';
import { type Prettify } from '~/lib/types';

type ErrorMessage<V extends null | string = string> =
  ((params: { min: number; value: V }) => string) | string;

interface NullableStringFieldOptions {
  readonly min?: number;
  readonly minErrorMessage?: ErrorMessage<string>;
}

export const NullableStringField = ({
  min,
  minErrorMessage = `The field must be at least ${min ?? 3} characters.`,
}: NullableStringFieldOptions) =>
  z
    .string()
    .nullable()
    .transform(v => (typeof v === 'string' && v.trim().length === 0 ? null : v))
    .superRefine((val, ctx) => {
      if (min && val !== null && val.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          inclusive: true,
          message:
            typeof minErrorMessage === 'function'
              ? minErrorMessage({ min, value: val })
              : minErrorMessage,
          minimum: min,
          type: 'string',
        });
      }
    });

interface NonNullableStringFieldOptions extends NullableStringFieldOptions {
  readonly requiredErrorMessage?: string;
}

export const NonNullableStringField = ({
  min,
  minErrorMessage = ({ min: minimum }) => `The field must be at least ${minimum} characters.`,
  requiredErrorMessage = 'The field is required.',
}: NonNullableStringFieldOptions) =>
  z.string().transform((v, ctx) => {
    let value: null | string = v;
    if (typeof v === 'string' && v.trim().length === 0) {
      value = null;
    }
    if (min !== undefined && value !== null && value.length < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        inclusive: true,
        message:
          typeof minErrorMessage === 'function' ? minErrorMessage({ min, value }) : minErrorMessage,
        minimum: min,
        type: 'string',
      });
      return z.NEVER;
    } else if (value === null) {
      if (min === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredErrorMessage,
        });
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          inclusive: true,
          message: requiredErrorMessage,
          minimum: min,
          type: 'string',
        });
      }
      return z.NEVER;
    }
    return value;
  });

type PartiallyParseableSchema = z.ZodObject<Record<string, z.ZodType<unknown>>>;

type Defaults<S extends PartiallyParseableSchema> = Partial<{
  [key in keyof S['shape']]: NonNullable<z.infer<S['shape'][key]>>;
}>;

type PartiallyParseOptions<S extends PartiallyParseableSchema, D extends Defaults<S>> = {
  readonly defaults?: D;
  readonly logWhenInvalid?: boolean;
};

type DefaultedKeys<S extends PartiallyParseableSchema, D extends Defaults<S>> = keyof D;
type NonDefaultedKeys<S extends PartiallyParseableSchema, D extends Defaults<S>> = Exclude<
  keyof S['shape'],
  keyof D
>;

type PartiallyParsed<S extends PartiallyParseableSchema, D extends Defaults<S>> = Prettify<
  { [key in DefaultedKeys<S, D>]: D[key] } & {
    [key in NonDefaultedKeys<S, D>]?: z.infer<S['shape'][key]>;
  }
>;

type PartiallyParsedReturn<
  S extends PartiallyParseableSchema,
  D extends Defaults<S>,
  O extends PartiallyParseOptions<S, D>,
> = O extends { defaults: infer InferredDefaults extends Defaults<S> }
  ? PartiallyParsed<S, InferredDefaults>
  : z.infer<S>;

/**
 * Uses a zod schema, {@link z.ZodObject}, to parse an object, {@link Record<string, unknown>},
 * without failing if individual fields of the object are invalid, but instead simply returning an
 * object, {@link Record<string, unknown>}, constructed from the fields of the original object that
 * are deemed valid based on their definition in the provided schema, {@link z.ZodObject}.
 *
 * In other words, instead of the entire parse operation failing if a single field is invalid, this
 * method will return an object simply omitting that invalid field from the result.
 *
 * A default set of values can be provided as an option, which will be used in the case that the
 * field is invalid or undefined.
 *
 * @example
 * const schema = z.object({
 *   foo: z.string().optional(),
 *   bar: z.number(),
 * })
 * // Returns { bar: 5 }
 * const parsed = partiallyParseObjectWithSchema({ bar: 5, foo: 10 }, schema, {})
 */
export const partiallyParseObjectWithSchema = <
  S extends PartiallyParseableSchema,
  D extends Defaults<S>,
  O extends PartiallyParseOptions<S, D>,
>(
  params: unknown,
  schema: S,
  options: O,
): PartiallyParsedReturn<S, D, O> => {
  const data: Record<string, unknown> = isRecordType(params) ? params : {};
  const defaults: Record<string, unknown> | undefined = isRecordType(options.defaults)
    ? options.defaults
    : undefined;
  return Object.keys(schema.shape).reduce(
    (acc, key): PartiallyParsedReturn<S, D, O> => {
      const fieldSchema: z.ZodType<unknown> = schema.shape[key];
      const v = data[key];
      if (v === undefined && defaults !== undefined) {
        return { ...acc, [key]: defaults[key] };
      }
      const parsed = fieldSchema.safeParse(v);
      if (parsed.success) {
        return { ...acc, [key]: parsed.data };
      } else if (options.logWhenInvalid) {
        logger.error(
          `Failed to parse the field '${key}' on the object: ` +
            `${parsed.error.errors[0].message} (code = ${parsed.error.errors[0].code})`,
        );
      }
      if (defaults !== undefined) {
        return { ...acc, [key]: defaults[key] };
      }
      return acc;
    },
    {} as PartiallyParsedReturn<S, D, O>,
  );
};
