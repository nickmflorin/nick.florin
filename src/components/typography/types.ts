import clsx from "clsx";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { type ComponentProps } from "~/components/types";

export const TypographySizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "md", "mdl", "lg", "xl"] as const,
  {},
);
export type TypographySize = EnumeratedLiteralsType<typeof TypographySizes>;

export const FontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);
export type FontWeight = EnumeratedLiteralsType<typeof FontWeights>;

export const TextTransforms = enumeratedLiterals(
  ["uppercase", "lowercase", "capitalize", "underline"] as const,
  {},
);
export type TextTransform = EnumeratedLiteralsType<typeof TextTransforms>;

export const FontFamilies = enumeratedLiterals(["inter", "avenir", "roboto"] as const, {});
export type FontFamily = EnumeratedLiteralsType<typeof FontFamilies>;

export interface BaseTypographyProps extends ComponentProps {
  readonly size?: TypographySize;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly transform?: TextTransform;
}

export const getTypographyClassName = <P extends BaseTypographyProps>(props: P): string =>
  clsx(
    props.size && `font-size-${props.size}`,
    props.fontFamily && `font-family-${props.fontFamily}`,
    props.transform && `text-transform-${props.transform}`,
    props.fontWeight && `font-weight-${props.fontWeight}`,
    props.className,
  );
