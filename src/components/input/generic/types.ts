import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

export const InputSizes = enumeratedLiterals(["small", "medium", "large"] as const, {});
export type InputSize = EnumeratedLiteralsMember<typeof InputSizes>;

export const InputVariants = enumeratedLiterals(["primary", "bare"] as const, {});
export type InputVariant = EnumeratedLiteralsMember<typeof InputVariants>;
