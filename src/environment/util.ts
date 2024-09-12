import { z } from "zod";

export const StringBooleanFlagSchema = z.union([
  z
    .custom<true>(val => typeof val === "string" && val.toLowerCase() === "true")
    .transform(() => true),
  z
    .custom<false>(val => typeof val === "string" && val.toLowerCase() === "false")
    .transform(() => false),
  z.boolean(),
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
