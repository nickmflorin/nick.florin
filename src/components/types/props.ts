import type React from "react";

import clsx, { type ClassArray, type ClassValue } from "clsx";
import { z } from "zod";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

import { type ClassName } from "./classes";

export type Style = React.CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
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
