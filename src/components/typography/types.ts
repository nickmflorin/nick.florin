import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const TypographySizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "md", "lg", "xl"] as const,
  {},
);
export type TypographySize = EnumeratedLiteralsType<typeof TypographySizes>;

export const FontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);
export type FontWeight = EnumeratedLiteralsType<typeof FontWeights>;
