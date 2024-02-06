import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const FieldConditions = enumeratedLiterals(["required", "optional"] as const, {});
export type FieldCondition = EnumeratedLiteralsType<typeof FieldConditions>;
