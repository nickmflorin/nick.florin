import type React from "react";
import { type ForwardedRef } from "react";

/* eslint-disable-next-line no-restricted-imports */
import clsx from "clsx";
import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { omit } from "lodash-es";

import type { QuantitativeSize } from "~/components/types/sizes";
import { sizeToString } from "~/components/types/sizes";

import { classNames } from "./classes";

export const DiscreteFontSizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);
export type DiscreteFontSize = EnumeratedLiteralsMember<typeof DiscreteFontSizes>;

export type FontSize =
  | DiscreteFontSize
  | QuantitativeSize<"px">
  | QuantitativeSize<"rem">
  | "inherit";

export const DiscreteLineHeights = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);
export type DiscreteLineHeight = EnumeratedLiteralsMember<typeof DiscreteLineHeights>;

export const LineHeightClassNames: { [key in DiscreteLineHeight]: `leading-${key}` } = {
  xxxs: "leading-xxxs",
  xxs: "leading-xxs",
  xs: "leading-xs",
  sm: "leading-sm",
  smplus: "leading-smplus",
  md: "leading-md",
  lg: "leading-lg",
  xl: "leading-xl",
};

export type LineHeight =
  | DiscreteLineHeight
  | QuantitativeSize<"px">
  | QuantitativeSize<"rem">
  | "inherit";

export const TypographyVariants = enumeratedLiterals(["text", "title", "label"] as const, {});
export type TypographyVariant = EnumeratedLiteralsMember<typeof TypographyVariants>;

export type TypographyComponent<T extends TypographyVariant = TypographyVariant> = {
  text: "span" | "div" | "p";
  title: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  label: "label" | "div";
}[T];

export type AnyTypographyComponent =
  | "div"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label";

export type TypographyRef<C extends AnyTypographyComponent> = {
  div: ForwardedRef<HTMLDivElement>;
  span: ForwardedRef<HTMLSpanElement>;
  p: ForwardedRef<HTMLParagraphElement>;
  h1: ForwardedRef<HTMLHeadingElement>;
  h2: ForwardedRef<HTMLHeadingElement>;
  h3: ForwardedRef<HTMLHeadingElement>;
  h4: ForwardedRef<HTMLHeadingElement>;
  h5: ForwardedRef<HTMLHeadingElement>;
  h6: ForwardedRef<HTMLHeadingElement>;
  label: ForwardedRef<HTMLLabelElement>;
}[C];

export const DiscreteTextAligns = enumeratedLiterals(
  ["left", "center", "right", "justify", "start", "end"] as const,
  {},
);
export type DiscreteTextAlign = EnumeratedLiteralsMember<typeof DiscreteTextAligns>;

export const TextAlignClassNames: { [key in DiscreteTextAlign]: `text-${key}` } = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
  start: "text-start",
  end: "text-end",
};

export type TextAlign = DiscreteTextAlign | "inherit";

export const HorizontalFlexAligns = enumeratedLiterals(["left", "center", "right"] as const, {});
export type HorizontalFlexAlign = EnumeratedLiteralsMember<typeof HorizontalFlexAligns>;

export const HorizontalFlexAlignClassNames: { [key in HorizontalFlexAlign]: `justify-${string}` } =
  {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

export const WhiteSpaces = enumeratedLiterals(["normal", "nowrap"] as const, {});
export type WhiteSpace = EnumeratedLiteralsMember<typeof WhiteSpaces>;

export const WhiteSpaceClassNames: { [key in WhiteSpace]: `whitespace-${key}` } = {
  nowrap: "whitespace-nowrap",
  normal: "whitespace-normal",
};

export const DiscreteFontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);
export type DiscreteFontWeight = EnumeratedLiteralsMember<typeof DiscreteFontWeights>;

export type FontWeight = DiscreteFontWeight | "inherit";

export const TitleFontSizeOrderMap = {
  xxxs: "h6",
  xxs: "h6",
  xs: "h6",
  sm: "h5",
  smplus: "h4",
  md: "h3",
  lg: "h2",
  xl: "h1",
} as const satisfies { [key in DiscreteFontSize]: TypographyComponent<"title"> };

export const TextTransforms = enumeratedLiterals(
  ["uppercase", "lowercase", "capitalize", "underline"] as const,
  {},
);
export type TextTransform = EnumeratedLiteralsMember<typeof TextTransforms>;

export const FontFamilies = enumeratedLiterals(["inter"] as const, {});
export type FontFamily = EnumeratedLiteralsMember<typeof FontFamilies>;

export type LineClamp = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const lineClampClassName = (clamp: LineClamp = 0) => {
  if (clamp === 0) {
    return "";
  }
  return classNames("break-words", {
    "line-clamp-1": clamp === 1,
    "line-clamp-2": clamp === 2,
    "line-clamp-3": clamp === 3,
    "line-clamp-4": clamp === 4,
    "line-clamp-5": clamp === 5,
    "line-clamp-6": clamp === 6,
  });
};

export type TypographyCharacteristics = {
  readonly fontSize?: FontSize;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly transform?: TextTransform;
  readonly lineClamp?: LineClamp;
  readonly truncate?: boolean;
  readonly align?: TextAlign;
  readonly whiteSpace?: WhiteSpace;
  readonly lineHeight?: LineHeight;
};

const TypographyPropNames: { [key in keyof Required<TypographyCharacteristics>]: true } = {
  fontSize: true,
  fontWeight: true,
  fontFamily: true,
  transform: true,
  lineClamp: true,
  truncate: true,
  align: true,
  whiteSpace: true,
  lineHeight: true,
};

export const omitTypographyProps = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, keyof TypographyCharacteristics> =>
  omit(props, Object.keys(TypographyPropNames) as (keyof TypographyCharacteristics)[]);

export const getTypographyClassName = (props: TypographyCharacteristics): string =>
  clsx(
    /* Note: The 'fontSize' class name cannot be called 'font-size-<size>' because it can conflict
       with Tailwind class names and confuses the TWMerge package:
       https://github.com/dcastil/tailwind-merge/blob/v2.4.0/docs/limitations.md  */
    props.fontSize && DiscreteFontSizes.contains(props.fontSize) ? `f-size-${props.fontSize}` : "",
    props.lineHeight && DiscreteLineHeights.contains(props.lineHeight)
      ? LineHeightClassNames[props.lineHeight]
      : "",
    props.fontFamily && `f-family-${props.fontFamily}`,
    props.transform && `f-transform-${props.transform}`,
    props.fontWeight && DiscreteFontWeights.contains(props.fontWeight)
      ? `f-weight-${props.fontWeight}`
      : "",
    props.align && DiscreteTextAligns.contains(props.align) ? TextAlignClassNames[props.align] : "",
    props.whiteSpace && WhiteSpaceClassNames[props.whiteSpace],
    props.lineClamp !== undefined ? lineClampClassName(props.lineClamp) : "",
    { truncate: props.truncate },
  );

export const getTypographyStyle = (props: TypographyCharacteristics): React.CSSProperties => ({
  fontSize:
    props.fontSize && !DiscreteFontSizes.contains(props.fontSize)
      ? props.fontSize === "inherit"
        ? "inherit"
        : typeof props.fontSize === "number"
          ? sizeToString(props.fontSize, "px")
          : sizeToString(props.fontSize)
      : undefined,
  lineHeight:
    props.lineHeight && !DiscreteLineHeights.contains(props.lineHeight)
      ? props.lineHeight === "inherit"
        ? "inherit"
        : typeof props.lineHeight === "number"
          ? sizeToString(props.lineHeight, "px")
          : sizeToString(props.lineHeight)
      : undefined,
  textAlign: props.align && !DiscreteTextAligns.contains(props.align) ? props.align : undefined,
  fontWeight:
    props.fontWeight && !DiscreteFontWeights.contains(props.fontWeight)
      ? props.fontWeight
      : undefined,
});

export const getTypographyComponentProps = (props: TypographyCharacteristics) => ({
  className: getTypographyClassName(props),
  style: getTypographyStyle(props),
});

export type TypographyVisibilityState = "expanded" | "collapsed";
