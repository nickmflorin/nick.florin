import type React from "react";

import clsx, { type ClassArray, type ClassValue } from "clsx";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export type ClassName = ClassValue | ClassArray;

export type Style = React.CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
};

export const classNameContains = (
  className: ClassName | undefined,
  conditional: string | ((v: string) => boolean),
): boolean => {
  const cs = clsx(className);
  const classnames = cs
    .split(" ")
    .map(c => c.trim())
    .map(v => (v.startsWith("!") ? v.slice(1) : v));
  return classnames.some(c =>
    typeof conditional === "string" ? c === conditional : conditional(c),
  );
};

const prefixIsInvalid = (prefix: string): boolean => prefix.trim().length === 0;

export const withoutOverridingClassName = (
  overriding: string,
  cs: ClassName,
  opts?: { prefix?: string },
): string => {
  let prefix: string;
  if (opts?.prefix !== undefined) {
    if (prefixIsInvalid(opts.prefix)) {
      throw new Error(`The prefix '${opts.prefix}' is invalid, it must have at least 1 character.`);
    }
    prefix = opts.prefix;
  } else if (!overriding.includes("-") || prefixIsInvalid(overriding.split("-")[0])) {
    throw new Error(
      `The overriding class name '${overriding}' is invalid, it must have a valid prefix.`,
    );
  } else {
    prefix = overriding.split("-")[0];
  }
  return clsx({ [overriding]: !classNameContains(cs, c => c.startsWith(prefix)) }, cs);
};

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
export type SizeString = `${number}${SizeUnit}`;
export type Size = SizeString | number;

export const sizeToString = (size: Size): SizeString =>
  typeof size === "number" ? `${size}px` : size;

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
