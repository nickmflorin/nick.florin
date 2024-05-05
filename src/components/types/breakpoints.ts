import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const ScreenSizes = enumeratedLiterals(["xs", "sm", "md", "lg", "xl", "2xl"] as const, {});
export type ScreenSize = EnumeratedLiteralsType<typeof ScreenSizes>;

export const ScreenSizeWidths: { [key in ScreenSize]: number } = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type GetMediaQueryParams =
  | { min: ScreenSize; max: Exclude<ScreenSize, "xs"> }
  | { min: ScreenSize; max?: never }
  | { min?: never; max: Exclude<ScreenSize, "xs"> };

export const getMediaQuery = ({ min, max }: GetMediaQueryParams) => {
  if (min && max) {
    return `(min-width: ${ScreenSizeWidths[min]}px) and (max-width: ${
      ScreenSizeWidths[max] - 1
    }px)`;
  } else if (min) {
    return `(min-width: ${ScreenSizeWidths[min]}px)`;
  } else if (max) {
    return `(max-width: ${ScreenSizeWidths[max] - 1}px)`;
  }
  throw new Error("Invalid Function Implementation: The min or max value must be provided.");
};

export type Breakpoint<B extends ScreenSize = ScreenSize> = B | `max-${B}`;

export type BreakPointClassName<
  T extends string,
  B extends ScreenSize = ScreenSize,
> = B extends ScreenSize ? T | `${ScreenSize}:${T}` | `max-${ScreenSize}:${T}` : never;

const TailwindScreenSizeModifierRegex =
  /^((xs|sm|md|lg|xl|2xl):max-(xs|sm|md|lg|xl|2xl)|(max-(xs|sm|md|lg|xl|2xl)))$/;

export const isTailwindScreenSizeModifier = (modifier: string) =>
  TailwindScreenSizeModifierRegex.test(modifier);
