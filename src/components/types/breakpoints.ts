import {
  enumeratedLiterals,
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
} from 'enumerated-literals';

import { logger } from '~/internal/logger';
import { humanizeList } from '~/lib/formatters';

import {
  inferQuantitativeSizeValue,
  type InferQuantitativeSizeValue,
  isQuantitativeSize,
  isQuantitativeSizeOfUnit,
  type QuantitativeSize,
  type QuantitativeSizeString,
  sizeToString,
  type UnitlessSize,
} from '~/components/types/sizes';

import { Theme } from './theme';

export const Breakpoints = enumeratedLiterals(
  [
    { size: inferQuantitativeSizeValue(Theme.theme.screens.xxs), value: 'xxs' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens.xs), value: 'xs' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens.sm), value: 'sm' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens.md), value: 'md' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens.lg), value: 'lg' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens.xl), value: 'xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.screens['2xl']), value: '2xl' },
  ] as const satisfies {
    size: InferQuantitativeSizeValue<
      (typeof Theme.theme.screens)[keyof typeof Theme.theme.screens]
    >;
    value: keyof typeof Theme.theme.screens;
  }[],
  {},
);

Object.keys(Theme.theme.screens).forEach(key => {
  if (!Breakpoints.contains(key)) {
    throw new Error(`Breakpoints are missing a breakpoint for Tailwind Config key '${key}'!`);
  }
});

Breakpoints.models.forEach(bp => {
  if (Theme.theme.screens[bp.value] !== sizeToString(bp.size, 'px')) {
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
>['size'];

export type ScreenSize = Breakpoint | QuantitativeSize<'px'>;

/**
 * Returns the {@link Breakpoint} that a viewport of the provided width falls into, or `'0'` when
 * the width is below the smallest breakpoint.
 *
 * Unlike {@link getBreakpointFromWindow}, this derives the breakpoint purely from a numeric
 * width, so it can run on the server (and during the client's first render) where no `window`
 * exists to match media queries against.
 */
export const getBreakpointFromWidth = (width: number): '0' | Breakpoint => {
  let breakpoint: '0' | Breakpoint = '0';
  for (const model of Breakpoints.models) {
    if (width >= model.size) {
      breakpoint = model.value;
    }
  }
  return breakpoint;
};

export const isScreenSize = (value: unknown): value is ScreenSize => {
  if (typeof value === 'string') {
    return isQuantitativeSizeOfUnit(value, 'px') || Breakpoints.contains(value);
  }
  return false;
};

type GetQuantitativeSizeOptions = {
  readonly as?: 'number' | 'string';
};

type QuantitativeScreenSize<
  T extends ScreenSize,
  O extends GetQuantitativeSizeOptions,
> = O extends { as: 'string' }
  ? T extends UnitlessSize
    ? QuantitativeSizeString<'px', T>
    : T extends Breakpoint
      ? QuantitativeSizeString<'px', BreakpointSize<T>>
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
    if (options?.as === 'string') {
      return sizeToString(size, 'px') as QuantitativeScreenSize<T, O>;
    }
    return inferQuantitativeSizeValue(size) as QuantitativeScreenSize<T, O>;
  }
  const numericSize = Breakpoints.getModel(size).size;
  if (options?.as === 'string') {
    return sizeToString(numericSize, 'px') as QuantitativeScreenSize<T, O>;
  }
  return numericSize as QuantitativeScreenSize<T, O>;
};

const mediaQueryString = (constraint: 'max' | 'min', size: ScreenSize): string => {
  const sizeValue = Breakpoints.contains(size)
    ? sizeToString(
        constraint === 'min'
          ? getQuantitativeScreenSize(size, { as: 'number' })
          : getQuantitativeScreenSize(size, { as: 'number' }) + 1,
        'px',
      )
    : sizeToString(size, 'px');
  return `(${constraint}-width: ${sizeValue})`;
};

type GetMediaQueryParams =
  | { max: Exclude<ScreenSize, 'xxs'>; min: ScreenSize }
  | { max: Exclude<ScreenSize, 'xxs'>; min?: never }
  | { max?: never; min: ScreenSize };

export const getMediaQuery = ({ max, min }: GetMediaQueryParams) => {
  if (min && max) {
    if (min === max) {
      throw new Error('Invalid Function Implementation: The min and max value cannot be the same.');
    }
    return `${mediaQueryString('min', min)} and ${mediaQueryString('max', max)}`;
  } else if (min) {
    return mediaQueryString('min', min);
  } else if (max) {
    return mediaQueryString('max', max);
  }
  throw new Error('Invalid Function Implementation: The min or max value must be provided.');
};

export const getLowerRangeBreakpoint = (size: QuantitativeSize<'px'>): '0' | Breakpoint => {
  const numericSize = getQuantitativeScreenSize(size, { as: 'number' });
  for (let i = 0; i < Breakpoints.models.length; i++) {
    if (i === Breakpoints.models.length - 1) {
      if (numericSize < Breakpoints.models[i].size) {
        return Breakpoints.models[i].value;
      }
    } else if (
      numericSize >= Breakpoints.models[i].size &&
      numericSize < Breakpoints.models[i + 1].size
    ) {
      return Breakpoints.models[i].value;
    }
  }
  return '0';
};

export const getBreakpointFromWindow = (w: Window): '0' | Breakpoint => {
  let breakpoint: Breakpoint | null = null;
  for (let i = 0; i < Breakpoints.members.length; i++) {
    let mediaQuery: string;
    if (i === Breakpoints.members.length - 1) {
      mediaQuery = getMediaQuery({
        min: Breakpoints.members[i],
      });
    } else {
      mediaQuery = getMediaQuery({
        max: Breakpoints.members[i + 1] as Exclude<Breakpoint, 'xxs'>,
        min: Breakpoints.members[i],
      });
    }
    if (w.matchMedia(mediaQuery).matches) {
      breakpoint = Breakpoints.members[i];
    }
  }
  if (!breakpoint) {
    return '0';
  }
  return breakpoint;
};

type SizeRange<K extends ContainerSize | ScreenSize> = `${'0' | K}:${'inf' | K}`;
type SizeRangeMap<K extends ContainerSize | ScreenSize, T> = Partial<Record<SizeRange<K>, T>>;

export type ScreenSizeRange = SizeRange<ScreenSize>;

const parseRange = <T extends ContainerSize | ScreenSize>(
  range: SizeRange<T>,
  typeguard: (value: unknown) => value is T,
): ['0' | T, 'inf' | T] => {
  const split = range.split(':');
  if (
    split.length !== 2 ||
    (!typeguard(split[0]) && split[0] !== '0') ||
    (!typeguard(split[1]) && split[1] !== 'inf')
  ) {
    throw new TypeError(`Invalid range '${range}' provided!`);
  }
  return split as ['0' | T, 'inf' | T];
};

export const screenSizeIsInRange = (size: ScreenSize, range: ScreenSizeRange): boolean => {
  const [_min, _max] = parseRange(range, isScreenSize);
  const min = _min === '0' ? 0 : getQuantitativeScreenSize(_min, { as: 'number' });
  const max = _max === 'inf' ? Infinity : getQuantitativeScreenSize(_max, { as: 'number' });
  if (min === max || min > max) {
    throw new TypeError(
      `Invalid range '${range}' provided! The minimum value '${min}' must be less ` +
        `than the maximum value '${max}'.`,
    );
  }
  const control = getQuantitativeScreenSize(size, { as: 'number' });
  return control >= min && control < max;
};

const getFromSizeRangeMap = <K extends ContainerSize | ScreenSize, T>(
  size: K,
  map: SizeRangeMap<K, T>,
  isInRange: (size: K, range: SizeRange<K>) => boolean,
): null | T => {
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

export type ScreenSizeRangeMap<T> = Partial<Record<ScreenSizeRange, T>>;

export const getFromScreenSizeRangeMap = <T>(
  size: ScreenSize,
  map: ScreenSizeRangeMap<T>,
): null | T => getFromSizeRangeMap(size, map, screenSizeIsInRange);

export const ContainerBreakpoints = enumeratedLiterals(
  [
    { size: inferQuantitativeSizeValue(Theme.theme.containers.xs), value: 'xs' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers.sm), value: 'sm' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers.md), value: 'md' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers.lg), value: 'lg' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers.xl), value: 'xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['2xl']), value: '2xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['3xl']), value: '3xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['4xl']), value: '4xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['5xl']), value: '5xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['6xl']), value: '6xl' },
    { size: inferQuantitativeSizeValue(Theme.theme.containers['7xl']), value: '7xl' },
  ] as const satisfies {
    size: InferQuantitativeSizeValue<
      (typeof Theme.theme.containers)[keyof typeof Theme.theme.containers]
    >;
    value: keyof typeof Theme.theme.containers;
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
  if (Theme.theme.containers[bp.value] !== sizeToString(bp.size, 'px')) {
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
>['size'];

export type ContainerSize = ContainerBreakpoint | QuantitativeSize<'px'>;

export const isContainerSize = (value: unknown): value is ContainerSize => {
  if (typeof value === 'string') {
    return isQuantitativeSizeOfUnit(value, 'px') || ContainerBreakpoints.contains(value);
  }
  return false;
};

type QuantitativeContainerSize<
  T extends ContainerSize,
  O extends GetQuantitativeSizeOptions,
> = O extends { as: 'string' }
  ? T extends UnitlessSize
    ? QuantitativeSizeString<'px', T>
    : T extends Breakpoint
      ? QuantitativeSizeString<'px', BreakpointSize<T>>
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
    if (options?.as === 'string') {
      return sizeToString(size, 'px') as QuantitativeContainerSize<T, O>;
    }
    return inferQuantitativeSizeValue(size) as QuantitativeContainerSize<T, O>;
  }
  const numericSize = ContainerBreakpoints.getModel(size).size;
  if (options?.as === 'string') {
    return sizeToString(numericSize, 'px') as QuantitativeContainerSize<T, O>;
  }
  return numericSize as QuantitativeContainerSize<T, O>;
};

export const getLowerRangeContainerBreakpoint = (
  size: QuantitativeSize<'px'>,
): '0' | ContainerBreakpoint => {
  const numericSize = getQuantitativeScreenSize(size, { as: 'number' });
  for (let i = 0; i < ContainerBreakpoints.models.length; i++) {
    if (i === ContainerBreakpoints.models.length - 1) {
      if (numericSize < ContainerBreakpoints.models[i].size) {
        return ContainerBreakpoints.models[i].value;
      }
    } else if (
      numericSize >= ContainerBreakpoints.models[i].size &&
      numericSize < ContainerBreakpoints.models[i + 1].size
    ) {
      return ContainerBreakpoints.models[i].value;
    }
  }
  return '0';
};

export type ContainerSizeRange = SizeRange<ContainerSize>;

export const containerSizeIsInRange = (size: ContainerSize, range: ContainerSizeRange): boolean => {
  const [_min, _max] = parseRange(range, isContainerSize);
  const min = _min === '0' ? 0 : getQuantitativeContainerSize(_min, { as: 'number' });
  const max = _max === 'inf' ? Infinity : getQuantitativeContainerSize(_max, { as: 'number' });
  if (min === max || min > max) {
    throw new TypeError(
      `Invalid range '${range}' provided! The minimum value '${min}' must be less ` +
        `than the maximum value '${max}'.`,
    );
  }
  const control = getQuantitativeContainerSize(size, { as: 'number' });
  return control >= min && control < max;
};

export type ContainerSizeRangeMap<T> = Partial<Record<ContainerSizeRange, T>>;

export const getFromContainerSizeRangeMap = <T>(
  size: ContainerSize,
  map: ContainerSizeRangeMap<T>,
): null | T => getFromSizeRangeMap(size, map, containerSizeIsInRange);
