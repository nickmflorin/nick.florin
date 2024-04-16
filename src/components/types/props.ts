import type React from "react";

import clsx, { type ClassArray, type ClassValue } from "clsx";
import { z } from "zod";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export type ClassName = ClassValue | ClassArray;

export type Style = React.CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
};

const getClassNameParts = (cs: ClassName | undefined) =>
  clsx(cs)
    .split(" ")
    .map(c => c.trim());

export const classNameContains = (
  className: ClassName | undefined,
  conditional: string | ((v: string) => boolean),
): boolean => {
  const cs = clsx(className);
  const classnames = getClassNameParts(cs).map(v => (v.startsWith("!") ? v.slice(1) : v));
  return classnames.some(c =>
    typeof conditional === "string" ? c === conditional : conditional(c),
  );
};

const prefixIsInvalid = (prefix: string): boolean => prefix.trim().length === 0;

type GetClassNamePrefixOptions = {
  readonly prefix?: string;
  readonly strict?: boolean;
};

type ClassNamePrefix<O extends GetClassNamePrefixOptions> = O extends { readonly strict: true }
  ? string
  : string | null;

const getClassNamePrefix = <O extends GetClassNamePrefixOptions>(
  cs: string,
  opts?: O,
): ClassNamePrefix<O> => {
  let prefix: string;
  if (opts?.prefix !== undefined || cs.includes("-")) {
    if (opts?.prefix !== undefined) {
      prefix = opts.prefix;
    } else {
      prefix = cs.split("-")[0];
    }
    if (prefixIsInvalid(prefix)) {
      if (opts?.strict) {
        throw new Error(`The prefix '${prefix}' is invalid, it must have at least 1 character.`);
      }
      return null as ClassNamePrefix<O>;
    }
    return prefix;
  }
  if (opts?.strict) {
    throw new Error(`The class name '${cs}' is invalid, it must have a valid prefix.`);
  }
  return null as ClassNamePrefix<O>;
};

export const withoutOverridingClassName = (
  overriding: string,
  cs: ClassName,
  opts?: { prefix?: string },
): string => {
  const prefix = getClassNamePrefix(overriding, { prefix: opts?.prefix, strict: true });
  return clsx({ [overriding]: !classNameContains(cs, c => c.startsWith(prefix)) });
};

export const mergeIntoClassNames = (base: ClassName, override: ClassName): string =>
  clsx(
    // Only include the class names from the base set that are not overridden by the override set.
    ...getClassNameParts(base).filter(pt =>
      getClassNameParts(override).some(ov => {
        const prefix = getClassNamePrefix(ov, { strict: false });
        if (!prefix) {
          return true;
        }
        return !classNameContains(pt, c => c.startsWith(prefix));
      }),
    ),
    override,
  );

export const BorderRadii = enumeratedLiterals(
  ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"] as const,
  {},
);
export type BorderRadius = EnumeratedLiteralsType<typeof BorderRadii>;

type RadiusClassNameRT<R extends BorderRadius | null | undefined> = R extends BorderRadius
  ? string
  : null;

export const radiusClassName = <R extends BorderRadius | null | undefined>(
  radius: R | null,
): RadiusClassNameRT<R> => {
  if (!radius) {
    return null as RadiusClassNameRT<R>;
  }
  return clsx({
    ["rounded-none"]: radius === BorderRadii.NONE,
    ["rounded-xs"]: radius === BorderRadii.XS,
    ["rounded-sm"]: radius === BorderRadii.SM,
    ["rounded-md"]: radius === BorderRadii.MD,
    ["rounded-lg"]: radius === BorderRadii.LG,
    ["rounded-xl"]: radius === BorderRadii.XL,
    ["rounded-2xl"]: radius === BorderRadii["2XL"],
    ["rounded-3xl"]: radius === BorderRadii["3XL"],
    ["rounded-full"]: radius === BorderRadii.FULL,
  }) as RadiusClassNameRT<R>;
};

export type SizeUnit = "px" | "rem";

export type QualitativeSize = "fit-content";

export type QuantitativeSizeString<
  U extends SizeUnit = SizeUnit,
  T extends number = number,
> = `${T}${U}`;

export type QuantitativeSize<U extends SizeUnit = SizeUnit> = QuantitativeSizeString<U> | number;
export type SizeString<U extends SizeUnit = SizeUnit> = QuantitativeSizeString<U> | QualitativeSize;

export type Size<U extends SizeUnit = SizeUnit> = QuantitativeSize<U> | QualitativeSize;

const QuantitativeSizeRegex = /^([0-9]*)(px|rem)$/;

type SizeToStringRT<
  T extends QuantitativeSizeString | QualitativeSize | number,
  U extends SizeUnit,
> = T extends number ? `${T}${U}` : T;

export function sizeToString<
  T extends QuantitativeSizeString | QualitativeSize | number,
  U extends SizeUnit,
>(size: T, unit: U): SizeToStringRT<T, U> {
  if (typeof size === "string") {
    return size as SizeToStringRT<T, U>;
  } else if (unit === undefined) {
    throw new TypeError(
      "Invalid Function Implementation: The unit must be provided for numeric values.",
    );
  }
  return `${size}${unit}` as SizeToStringRT<T, U>;
}

type SizeToNumberRT<T extends QuantitativeSize> = T extends `${infer N extends number}${SizeUnit}`
  ? N
  : T;

export const sizeToNumber = <T extends QuantitativeSize>(size: T): SizeToNumberRT<T> => {
  if (typeof size === "number") {
    return size as SizeToNumberRT<T>;
  }
  const executed = QuantitativeSizeRegex.exec(size);
  if (executed) {
    const sz = executed[1];
    const parsed = z.coerce.number().int().safeParse(sz);
    if (!parsed.success) {
      throw new TypeError(`The provided size string, '${size}', is invalid!`);
    }
    return parsed.data as SizeToNumberRT<T>;
  }
  throw new TypeError(`The provided size string, '${size}', is invalid!`);
};

/**
 * A type that represents the string, lowercase name of a native HTML element (i.e. "div" or "p").
 */
export type HTMLElementName = keyof JSX.IntrinsicElements;

export type RawHTMLElementProps<E extends HTMLElementName> = JSX.IntrinsicElements[E];

/**
 * The props that are associated with the {@link HTMLElement} dictated by the generic type argument,
 * {@link E}, with the internal type definitions injected.
 *
 * @example
 * HTMLElementProps<"div"> // Props for a <div> element with our internal definitions included.
 *
 * @example
 * // Props for a <div> element with our internal definitions included.
 * HTMLElementProps<HTMLDivElement>
 */
export type HTMLElementProps<E extends HTMLElementName> = Omit<
  RawHTMLElementProps<E>,
  keyof ComponentProps
>;
