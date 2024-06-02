import { enumeratedLiterals, type EnumeratedLiteralsType } from "enumerated-literals";

export const InputSizes = enumeratedLiterals(["small", "medium", "large"] as const, {});
export type InputSize = EnumeratedLiteralsType<typeof InputSizes>;

export const InputVariants = enumeratedLiterals(["primary", "bare"] as const, {});
export type InputVariant = EnumeratedLiteralsType<typeof InputVariants>;
