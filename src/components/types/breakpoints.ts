import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import resolveConfig from "tailwindcss/resolveConfig";

import { sizeToNumber, sizeToString, type QuantitativeSize } from "~/components/types/sizes";

import TailwindConfig from "../../tailwind.config";

const Theme = resolveConfig(TailwindConfig);

export const Breakpoints = enumeratedLiterals(
  ["xxs", "xs", "sm", "md", "lg", "xl", "2xl"] as const,
  {},
);
export type Breakpoint = EnumeratedLiteralsMember<typeof Breakpoints>;

export const ScreenSizeWidths: { [key in Breakpoint]: number } = {
  xxs: sizeToNumber(Theme.theme.screens.xxs),
  xs: sizeToNumber(Theme.theme.screens.xs),
  sm: sizeToNumber(Theme.theme.screens.sm),
  md: sizeToNumber(Theme.theme.screens.md),
  lg: sizeToNumber(Theme.theme.screens.lg),
  xl: sizeToNumber(Theme.theme.screens.xl),
  "2xl": sizeToNumber(Theme.theme.screens["2xl"]),
};

export type ScreenSize = Breakpoint | QuantitativeSize<"px">;

type GetMediaQueryParams =
  | { min: ScreenSize; max: Exclude<ScreenSize, "xxs"> }
  | { min: ScreenSize; max?: never }
  | { min?: never; max: Exclude<ScreenSize, "xxs"> };

const mediaQueryString = (constraint: "min" | "max", size: ScreenSize): string => {
  const sizeValue = Breakpoints.contains(size)
    ? sizeToString(constraint === "min" ? ScreenSizeWidths[size] : ScreenSizeWidths[size] + 1, "px")
    : sizeToString(size, "px");
  return `(${constraint}-width: ${sizeValue})`;
};

export const getMediaQuery = ({ min, max }: GetMediaQueryParams) => {
  if (min && max) {
    if (min === max) {
      throw new Error("Invalid Function Implementation: The min and max value cannot be the same.");
    }
    return `${mediaQueryString("min", min)} and ${mediaQueryString("max", max)}`;
  } else if (min) {
    return mediaQueryString("min", min);
  } else if (max) {
    return mediaQueryString("max", max);
  }
  throw new Error("Invalid Function Implementation: The min or max value must be provided.");
};
