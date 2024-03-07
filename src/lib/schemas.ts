import { z } from "zod";

type ErrorMessage<V extends string | null = string> =
  | string
  | ((params: { min: number; value: V }) => string);

type NullableStringFieldOptions = {
  readonly min?: number;
  readonly minErrorMessage?: ErrorMessage<string>;
};

export const NullableMinLengthStringField = ({
  min = 3,
  minErrorMessage = `The field must be at least ${min ?? 3} characters.`,
}: NullableStringFieldOptions) =>
  z
    .string()
    .nullable()
    .transform(v => (typeof v === "string" && v.trim().length === 0 ? null : v))
    .superRefine((val, ctx) => {
      if (val !== null && val.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: min,
          type: "string",
          inclusive: true,
          message:
            typeof minErrorMessage === "function"
              ? minErrorMessage({ value: val, min })
              : minErrorMessage,
        });
      }
    });

type NonNullableStringFieldOptions = {
  readonly min?: number;
  readonly minErrorMessage?: ErrorMessage<string | null>;
  readonly requiredErrorMessage?: ErrorMessage<string | null>;
};

export const NonNullableMinLengthStringField = ({
  min = 3,
  minErrorMessage = ({ min }) => `The field must be at least ${min ?? 3} characters.`,
  requiredErrorMessage = "The field is required.",
}: NonNullableStringFieldOptions) =>
  z.string().transform((v, ctx) => {
    let value: string | null = v;
    if (typeof v === "string" && v.trim().length === 0) {
      value = null;
    }
    if (value !== null && value.length < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        type: "string",
        inclusive: true,
        message:
          typeof minErrorMessage === "function" ? minErrorMessage({ value, min }) : minErrorMessage,
      });
      return z.NEVER;
    } else if (value === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        type: "string",
        inclusive: true,
        message:
          typeof requiredErrorMessage === "function"
            ? requiredErrorMessage({ value, min })
            : requiredErrorMessage,
      });
      return z.NEVER;
    }
    return value;
  });
