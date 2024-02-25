import { z } from "zod";

type NullableStringFieldOptions = {
  readonly min?: number;
  readonly minErrorMessage?: string;
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
          message: minErrorMessage,
        });
      }
    });
