import clsx from "clsx";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const FloatingVariants = enumeratedLiterals(["primary", "secondary", "none"] as const, {});
export type FloatingVariant = EnumeratedLiteralsType<typeof FloatingVariants>;

export const FloatingVariantClassNames: { [key in FloatingVariant]: string } = {
  [FloatingVariants.PRIMARY]: clsx("bg-blue-500", "text-white", "box-shadow-sm"),
  [FloatingVariants.SECONDARY]: clsx(
    "bg-gradient-to-r from-gray-50 to-gray-200",
    "text-heading",
    "box-shadow-lg",
  ),
  [FloatingVariants.NONE]: "",
};

export const FloatingVariantArrowClassNames: { [key in FloatingVariant]: string } = {
  [FloatingVariants.PRIMARY]: clsx(
    "fill-blue-500",
    "[&>path:first-of-type]:stroke-blue-500",
    "[&>path:last-of-type]:stroke-blue-500",
  ),
  [FloatingVariants.SECONDARY]: clsx("fill-white", "box-shadow-lg"),
  [FloatingVariants.NONE]: "",
};

export const getFloatingVariantClassName = (variant: FloatingVariant): string =>
  FloatingVariantClassNames[variant];

export const getFloatingArrowVariantClassName = (variant: FloatingVariant): string =>
  FloatingVariantArrowClassNames[variant];
