import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

export const BadgeSizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);

export type BadgeSize = EnumeratedLiteralsMember<typeof BadgeSizes>;
