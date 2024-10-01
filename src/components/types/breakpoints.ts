import {
  enumeratedLiterals,
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
} from "enumerated-literals";

import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";

import {
  isQuantitativeSize,
  inferQuantitativeSizeValue,
  type QuantitativeSizeString,
  sizeToString,
  type QuantitativeSize,
  type UnitlessSize,
  type InferQuantitativeSizeValue,
  isQuantitativeSizeOfUnit,
} from "~/components/types/sizes";

import { Theme } from "./theme";

export const Breakpoints = enumeratedLiterals(
  [
    { value: "xxs", size: inferQuantitativeSizeValue(Theme.theme.screens.xxs) },
    { value: "xs", size: inferQuantitativeSizeValue(Theme.theme.screens.xs) },
    { value: "sm", size: inferQuantitativeSizeValue(Theme.theme.screens.sm) },
    { value: "md", size: inferQuantitativeSizeValue(Theme.theme.screens.md) },
    { value: "lg", size: inferQuantitativeSizeValue(Theme.theme.screens.lg) },
    { value: "xl", size: inferQuantitativeSizeValue(Theme.theme.screens.xl) },
    { value: "2xl", size: inferQuantitativeSizeValue(Theme.theme.screens["2xl"]) },
  ] as const satisfies {
    value: keyof typeof Theme.theme.screens;
    size: InferQuantitativeSizeValue<
      (typeof Theme.theme.screens)[keyof typeof Theme.theme.screens]
    >;
  }[],
  {},
);

Object.keys(Theme.theme.screens).forEach(key => {
  if (!Breakpoints.contains(key)) {
    throw new Error(`Breakpoints are missing a breakpoint for Tailwind Config key '${key}'!`);
  }
});

Breakpoints.models.forEach(bp => {
  if (Theme.theme.screens[bp.value] === undefined) {
    throw new Error(`Breakpoint '${bp.value}' is missing from the Tailwind Config!`);
  } else if (Theme.theme.screens[bp.value] !== sizeToString(bp.size, "px")) {
    throw new Error(
      `Breakpoint '${bp.value}' has value '${bp.size}' that is inconsistent with ` +
        `value from Tailwind Config, '${Theme.theme.screens[bp.value]}'!`,
    );
  }
});

export type Breakpoint = EnumeratedLiteralsMember<typeof Breakpoints>;

export type BreakpointSize<B extends Breakpoint = Breakpoint> = Extract<
  EnumeratedLiteralsModel<typeof Breakpoints>,
  { value: B }
>["size"];

export type ScreenSize = Breakpoint | QuantitativeSize<"px">;

export const isScreenSize = (value: unknown): value is ScreenSize => {
  if (typeof value === "string") {
    return isQuantitativeSizeOfUnit(value, "px") || Breakpoints.contains(value);
  }
  return false;
};

type GetQuantitativeSizeOptions = {
  readonly as?: "number" | "string";
};

type QuantitativeScreenSize<
  T extends ScreenSize,
  O extends GetQuantitativeSizeOptions,
> = O extends { as: "string" }
  ? T extends UnitlessSize
    ? QuantitativeSizeString<"px", T>
    : T extends Breakpoint
      ? QuantitativeSizeString<"px", BreakpointSize<T>>
      : never
  : T extends UnitlessSize
    ? InferQuantitativeSizeValue<T>
    : T extends Breakpoint
      ? BreakpointSize<T>
      : never;

export const getQuantitativeScreenSize = <
  T extends ScreenSize,
  O extends GetQuantitativeSizeOptions,
>(
  size: T,
  options?: O,
): QuantitativeScreenSize<T, O> => {
  if (isQuantitativeSize(size)) {
    if (options?.as === "string") {
      return sizeToString(size, "px") as QuantitativeScreenSize<T, O>;
    }
    return size as QuantitativeScreenSize<T, O>;
  }
  const numericSize = Breakpoints.getModel(size).size;
  if (options?.as === "string") {
    return sizeToString(numericSize, "px") as QuantitativeScreenSize<T, O>;
  }
  return numericSize as QuantitativeScreenSize<T, O>;
};

const mediaQueryString = (constraint: "min" | "max", size: ScreenSize): string => {
  const sizeValue = Breakpoints.contains(size)
    ? sizeToString(
        constraint === "min"
          ? getQuantitativeScreenSize(size, { as: "number" })
          : getQuantitativeScreenSize(size, { as: "number" }) + 1,
        "px",
      )
    : sizeToString(size, "px");
  return `(${constraint}-width: ${sizeValue})`;
};

type GetMediaQueryParams =
  | { min: ScreenSize; max: Exclude<ScreenSize, "xxs"> }
  | { min: ScreenSize; max?: never }
  | { min?: never; max: Exclude<ScreenSize, "xxs"> };

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

type SizeRange<K extends ScreenSize | ContainerSize> = `${K | "0"}:${K | "inf"}`;
type SizeRangeMap<K extends ScreenSize | ContainerSize, T> = Partial<{ [key in SizeRange<K>]: T }>;

export type ScreenSizeRange = SizeRange<ScreenSize>;

const parseRange = <T extends ScreenSize | ContainerSize>(
  range: SizeRange<T>,
  typeguard: (value: unknown) => value is T,
): [T | "0", T | "inf"] => {
  const split = range.split(":");
  if (
    split.length !== 2 ||
    (!typeguard(split[0]) && split[0] !== "0") ||
    (!typeguard(split[1]) && split[1] !== "inf")
  ) {
    throw new TypeError(`Invalid range '${range}' provided!`);
  }
  return split as [T | "0", T | "inf"];
};

export const screenSizeIsInRange = (size: ScreenSize, range: ScreenSizeRange): boolean => {
  const [_min, _max] = parseRange(range, isScreenSize);
  const min = _min !== "0" ? getQuantitativeScreenSize(_min, { as: "number" }) : 0;
  const max = _max !== "inf" ? getQuantitativeScreenSize(_max, { as: "number" }) : Infinity;
  if (min === max || min > max) {
    throw new TypeError(`Invalid range '${range}' provided!`);
  }
  const control = getQuantitativeScreenSize(size, { as: "number" });
  return control >= min && control < max;
};

const getFromSizeRangeMap = <K extends ScreenSize | ContainerSize, T>(
  size: K,
  map: SizeRangeMap<K, T>,
  isInRange: (size: K, range: SizeRange<K>) => boolean,
): T | null => {
  const keys = Object.keys(map) as SizeRange<K>[];

  const keysInRange = keys.filter(key => isInRange(size, key));
  if (keysInRange.length >= 1) {
    if (keysInRange.length > 1) {
      const humanizedRanges = humanizeList(keysInRange.map(range => `'${range}'`));
      logger.warn(
        `Encountered multiple key ranges: ${humanizedRanges}, that map to the same size '${size}'!`,
      );
    }
    return map[keysInRange[0]] ?? null;
  }
  return null;
};

export type ScreenSizeRangeMap<T> = Partial<{ [key in ScreenSizeRange]: T }>;

export const getFromScreenSizeRangeMap = <T>(
  size: ScreenSize,
  map: ScreenSizeRangeMap<T>,
): T | null => getFromSizeRangeMap(size, map, screenSizeIsInRange);

export const ContainerBreakpoints = enumeratedLiterals(
  [
    { value: "xs", size: inferQuantitativeSizeValue(Theme.theme.containers.xs) },
    { value: "sm", size: inferQuantitativeSizeValue(Theme.theme.containers.sm) },
    { value: "md", size: inferQuantitativeSizeValue(Theme.theme.containers.md) },
    { value: "lg", size: inferQuantitativeSizeValue(Theme.theme.containers.lg) },
    { value: "xl", size: inferQuantitativeSizeValue(Theme.theme.containers.xl) },
    { value: "2xl", size: inferQuantitativeSizeValue(Theme.theme.containers["2xl"]) },
    { value: "3xl", size: inferQuantitativeSizeValue(Theme.theme.containers["3xl"]) },
    { value: "4xl", size: inferQuantitativeSizeValue(Theme.theme.containers["4xl"]) },
    { value: "5xl", size: inferQuantitativeSizeValue(Theme.theme.containers["5xl"]) },
    { value: "6xl", size: inferQuantitativeSizeValue(Theme.theme.containers["6xl"]) },
    { value: "7xl", size: inferQuantitativeSizeValue(Theme.theme.containers["7xl"]) },
  ] as const satisfies {
    value: keyof typeof Theme.theme.containers;
    size: InferQuantitativeSizeValue<
      (typeof Theme.theme.containers)[keyof typeof Theme.theme.containers]
    >;
  }[],
  {},
);

Object.keys(Theme.theme.containers).forEach(key => {
  if (!ContainerBreakpoints.contains(key)) {
    throw new Error(
      `Container breakpoints are missing a breakpoint for Tailwind Config key '${key}'!`,
    );
  }
});

ContainerBreakpoints.models.forEach(bp => {
  if (Theme.theme.containers[bp.value] === undefined) {
    throw new Error(`Container breakpoint '${bp.value}' is missing from the Tailwind Config!`);
  } else if (Theme.theme.containers[bp.value] !== sizeToString(bp.size, "px")) {
    throw new Error(
      `Container breakpoint '${bp.value}' has value '${bp.size}' that is inconsistent with ` +
        `value from Tailwind Config, '${Theme.theme.containers[bp.value]}'!`,
    );
  }
});

export type ContainerBreakpoint = EnumeratedLiteralsMember<typeof ContainerBreakpoints>;

export type ContainerBreakpointSize<B extends ContainerBreakpoint = ContainerBreakpoint> = Extract<
  EnumeratedLiteralsModel<typeof ContainerBreakpoints>,
  { value: B }
>["size"];

export type ContainerSize = ContainerBreakpoint | QuantitativeSize<"px">;

export const isContainerSize = (value: unknown): value is ContainerSize => {
  if (typeof value === "string") {
    return isQuantitativeSizeOfUnit(value, "px") || ContainerBreakpoints.contains(value);
  }
  return false;
};

type QuantitativeContainerSize<
  T extends ContainerSize,
  O extends GetQuantitativeSizeOptions,
> = O extends { as: "string" }
  ? T extends UnitlessSize
    ? QuantitativeSizeString<"px", T>
    : T extends Breakpoint
      ? QuantitativeSizeString<"px", BreakpointSize<T>>
      : never
  : T extends UnitlessSize
    ? InferQuantitativeSizeValue<T>
    : T extends Breakpoint
      ? BreakpointSize<T>
      : never;

export const getQuantitativeContainerSize = <
  T extends ContainerSize,
  O extends GetQuantitativeSizeOptions,
>(
  size: T,
  options?: O,
): QuantitativeContainerSize<T, O> => {
  if (isQuantitativeSize(size)) {
    if (options?.as === "string") {
      return sizeToString(size, "px") as QuantitativeContainerSize<T, O>;
    }
    return size as QuantitativeContainerSize<T, O>;
  }
  const numericSize = ContainerBreakpoints.getModel(size).size;
  if (options?.as === "string") {
    return sizeToString(numericSize, "px") as QuantitativeContainerSize<T, O>;
  }
  return numericSize as QuantitativeContainerSize<T, O>;
};

export type ContainerSizeRange = SizeRange<ContainerSize>;

export const containerSizeIsInRange = (size: ContainerSize, range: ContainerSizeRange): boolean => {
  const [_min, _max] = parseRange(range, isContainerSize);
  const min = _min !== "0" ? getQuantitativeContainerSize(_min, { as: "number" }) : 0;
  const max = _max !== "inf" ? getQuantitativeContainerSize(_max, { as: "number" }) : Infinity;
  if (min === max || min > max) {
    throw new TypeError(`Invalid range '${range}' provided!`);
  }
  const control = getQuantitativeContainerSize(size, { as: "number" });
  return control >= min && control < max;
};

export type ContainerSizeRangeMap<T> = Partial<{ [key in ContainerSizeRange]: T }>;

export const getFromContainerSizeRangeMap = <T>(
  size: ContainerSize,
  map: ContainerSizeRangeMap<T>,
): T | null => getFromSizeRangeMap(size, map, containerSizeIsInRange);
