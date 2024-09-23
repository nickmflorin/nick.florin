import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

export const InputSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge"] as const,
  {},
);
export type InputSize = EnumeratedLiteralsMember<typeof InputSizes>;

export const InputVariants = enumeratedLiterals(["primary", "bare"] as const, {});
export type InputVariant = EnumeratedLiteralsMember<typeof InputVariants>;

export type InputEventName =
  | "onFocus"
  | "onBlur"
  | "onPointerDown"
  | "onMouseDown"
  | "onClick"
  | "onKeyDown"
  | "onKeyUp"
  | "onFocusCapture";
