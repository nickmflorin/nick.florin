import type React from "react";

import { type ClassArray, type ClassValue } from "clsx";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export type ClassName = ClassValue | ClassArray;

export type Style = React.CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
};

export const BorderRadii = enumeratedLiterals(
  ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"] as const,
  {},
);
export type BorderRadius = EnumeratedLiteralsType<typeof BorderRadii>;

export type SizeUnit = "px" | "rem";
export type Size = `${number}${SizeUnit}` | number;

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
