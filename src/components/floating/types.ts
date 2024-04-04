import { type CSSProperties } from "react";

import { type ReferenceType, type useInteractions } from "@floating-ui/react";
import clsx from "clsx";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import {
  withoutOverridingClassName,
  type ComponentProps,
  type ClassName,
} from "~/components/types";

export const FloatingVariants = enumeratedLiterals(
  ["primary", "secondary", "light", "white", "none"] as const,
  {},
);
export type FloatingVariant = EnumeratedLiteralsType<typeof FloatingVariants>;

export const FloatingVariantClassNames: {
  [key in FloatingVariant]: (cs: ComponentProps["className"]) => string;
} = {
  [FloatingVariants.PRIMARY]: cs =>
    clsx(
      withoutOverridingClassName("text-white", cs),
      withoutOverridingClassName("bg-blue-500", cs),
      withoutOverridingClassName("shadow-md", cs),
      cs,
    ),
  [FloatingVariants.LIGHT]: cs =>
    clsx(
      withoutOverridingClassName("text-body", cs),
      withoutOverridingClassName("bg-gray-50", cs),
      withoutOverridingClassName("shadow-md", cs),
      cs,
    ),
  [FloatingVariants.SECONDARY]: cs =>
    clsx(
      withoutOverridingClassName("text-heading", cs),
      withoutOverridingClassName("bg-gradient-to-r from-gray-50 to-gray-200", cs, {
        prefix: "bg-",
      }),
      withoutOverridingClassName("shadow-md", cs),
      cs,
    ),
  [FloatingVariants.WHITE]: cs =>
    clsx(
      withoutOverridingClassName("text-body", cs),
      withoutOverridingClassName("bg-white", cs),
      withoutOverridingClassName("shadow-md", cs),
      cs,
    ),
  [FloatingVariants.NONE]: cs => clsx(cs),
};

export const FloatingVariantArrowClassNames: { [key in FloatingVariant]: string } = {
  [FloatingVariants.PRIMARY]: clsx(
    "fill-blue-500",
    "[&>path:first-of-type]:stroke-blue-500",
    "[&>path:last-of-type]:stroke-blue-500",
  ),
  [FloatingVariants.LIGHT]: clsx(
    "fill-gray-50",
    "[&>path:first-of-type]:stroke-gray-50",
    "[&>path:last-of-type]:stroke-gray-50",
  ),
  [FloatingVariants.SECONDARY]: clsx(
    "fill-gray-200",
    "[&>path:first-of-type]:stroke-gray-200",
    "[&>path:last-of-type]:stroke-gray-200",
  ),
  [FloatingVariants.WHITE]: clsx(
    "fill-white",
    "[&>path:first-of-type]:stroke-white",
    "[&>path:last-of-type]:stroke-white",
  ),
  [FloatingVariants.NONE]: "",
};

export const getFloatingVariantClassName = (
  variant: FloatingVariant,
  className: ClassName,
): string => FloatingVariantClassNames[variant](className);

export const getFloatingArrowVariantClassName = (variant: FloatingVariant): string =>
  FloatingVariantArrowClassNames[variant];

export type FloatingRenderProps = {
  readonly isOpen: boolean;
  readonly params: ReturnType<ReturnType<typeof useInteractions>["getReferenceProps"]>;
  readonly ref: (node: ReferenceType | null) => void;
};

export type FloatingContentRenderProps = {
  readonly params: Record<string, unknown>;
  readonly styles: CSSProperties;
  readonly ref: (node: HTMLElement | null) => void;
};

export type FloatingTrigger = "hover" | "click";
