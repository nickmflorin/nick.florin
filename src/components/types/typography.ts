/* eslint-disable-next-line no-restricted-imports */
import clsx from "clsx";
import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { omit } from "lodash-es";

import { classNames } from "./classes";

export const FontSizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);
export type FontSize = EnumeratedLiteralsMember<typeof FontSizes>;

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleComponent = `h${TitleOrder}`;

export const TextAligns = enumeratedLiterals(
  ["left", "center", "right", "justify", "start", "end"] as const,
  {},
);
export type TextAlign = EnumeratedLiteralsMember<typeof TextAligns>;

export const TextAlignClassNames: { [key in TextAlign]: `text-${key}` } = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
  start: "text-start",
  end: "text-end",
};

export const WhiteSpaces = enumeratedLiterals(["normal", "nowrap"] as const, {});
export type WhiteSpace = EnumeratedLiteralsMember<typeof WhiteSpaces>;

export const WhiteSpaceClassNames: { [key in WhiteSpace]: `whitespace-${key}` } = {
  nowrap: "whitespace-nowrap",
  normal: "whitespace-normal",
};

export const FontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);
export type FontWeight = EnumeratedLiteralsMember<typeof FontWeights>;

export const TitleFontSizeOrderMap = {
  xxxs: "h6",
  xxs: "h6",
  xs: "h6",
  sm: "h5",
  smplus: "h4",
  md: "h3",
  lg: "h2",
  xl: "h1",
} as const satisfies { [key in FontSize]: TitleComponent };

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

export interface TypographyCharacteristics {
  readonly fontSize?: FontSize;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly transform?: TextTransform;
  readonly lineClamp?: LineClamp;
  readonly truncate?: boolean;
  readonly align?: TextAlign;
  readonly whiteSpace?: WhiteSpace;
}

const TypographyPropNames: { [key in keyof TypographyCharacteristics]: true } = {
  fontSize: true,
  fontWeight: true,
  fontFamily: true,
  transform: true,
  lineClamp: true,
  truncate: true,
  align: true,
  whiteSpace: true,
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
    props.fontSize ? `f-size-${props.fontSize}` : "",
    props.fontFamily && `f-family-${props.fontFamily}`,
    props.transform && `f-transform-${props.transform}`,
    props.fontWeight && `f-weight-${props.fontWeight}`,
    props.align && TextAlignClassNames[props.align],
    props.whiteSpace && WhiteSpaceClassNames[props.whiteSpace],
    props.lineClamp !== undefined ? lineClampClassName(props.lineClamp) : "",
    { truncate: props.truncate },
  );

export type TypographyVisibilityState = "expanded" | "collapsed";
