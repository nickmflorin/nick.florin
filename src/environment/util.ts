import { z } from "zod";

import { type EnvironmentName, EnvironmentNames } from "./constants";

export const STRICT_OMISSION = z.literal("").optional();

export const testRestricted = <T>(v: T) => {
  if (process.env.NODE_ENV === "test") {
    return STRICT_OMISSION;
  }
  return v;
};

export const StringBooleanFlagSchema = z.union([
  z
    .custom<true>(val => typeof val === "string" && val.toLowerCase() === "true")
    .transform(() => true),
  z
    .custom<false>(val => typeof val === "string" && val.toLowerCase() === "false")
    .transform(() => false),
]);

type CommaSeparatedArraySchemaOptions<V extends readonly string[]> = {
  readonly partTransformer: (v: string) => string;
  readonly options: V;
};

export const createCommaSeparatedArraySchema = <V extends readonly string[]>(
  params: CommaSeparatedArraySchemaOptions<V>,
) =>
  z
    .string()
    .transform((value, ctx): V[number][] => {
      const parsed: string[] = value
        .split(",")
        .map(v => v.trim())
        .map(v => (params?.partTransformer ? params.partTransformer(v) : v));

      const invalid = parsed.filter(vi => !params.options.includes(vi));
      if (invalid.length !== 0) {
        invalid.map(inv => {
          ctx.addIssue({
            message: `The value '${inv}' is invalid. Must be one of ${params.options.join(",")}`,
            code: z.ZodIssueCode.invalid_enum_value,
            received: inv,
            options: [...params.options],
          });
        });
        return z.NEVER;
      }
      return parsed;
    })
    .optional();

export const environmentLookup = <T>(map: { [key in EnvironmentName]: T }): T => {
  if (process.env.VERCEL_ENV !== undefined) {
    if (!EnvironmentNames.contains(process.env.VERCEL_ENV)) {
      throw new Error(
        `The provided map does not have a key for VERCEL_ENV='${process.env.VERCEL_ENV}'!`,
      );
    }
    return map[process.env.VERCEL_ENV];
  } else if (process.env.NODE_ENV === "development") {
    return map.local;
  }
  return map[process.env.NODE_ENV];
};
