import { type ReactElement, type JSXElementConstructor, isValidElement } from "react";

import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { isFragment } from "react-is";

import { classNames } from "~/components/types";

import tailwindConfig from "~/tailwind.config";

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

export const TextFontSizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);

export type TextFontSize = EnumeratedLiteralsMember<typeof TextFontSizes>;

export const LabelFontSizes = TextFontSizes;
export type LabelFontSize = TextFontSize;

export const DescriptionFontSizes = TextFontSizes;
export type DescriptionFontSize = TextFontSize;

export const TitleFontSizes = TextFontSizes;
export type TitleFontSize = TextFontSize;

export const FontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);

export type FontWeight = EnumeratedLiteralsMember<typeof FontWeights>;

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

export const TitleFontSizeOrderMap: { [key in TitleFontSize]: TitleOrder } = {
  xxxs: 6,
  xxs: 6,
  xs: 5,
  sm: 4,
  smplus: 4,
  md: 3,
  lg: 2,
  xl: 1,
};

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

export interface TypographyCharacteristics<
  F extends TextFontSize | TitleFontSize | LabelFontSize | DescriptionFontSize = TextFontSize,
> {
  readonly fontSize?: F;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly transform?: TextTransform;
  readonly lineClamp?: LineClamp;
  readonly truncate?: boolean;
  readonly align?: TextAlign;
}

export const getTypographyClassName = (props: TypographyCharacteristics): string =>
  classNames(
    /* Note: The 'fontSize' class name cannot be called 'font-size-<size>' because it can conflict
       with Tailwind class names and confuses the TWMerge package:
       https://github.com/dcastil/tailwind-merge/blob/v2.4.0/docs/limitations.md  */
    props.fontSize ? `f-size-${props.fontSize}` : "",
    props.fontFamily && `f-family-${props.fontFamily}`,
    props.transform && `f-transform-${props.transform}`,
    props.fontWeight && `f-weight-${props.fontWeight}`,
    props.align && TextAlignClassNames[props.align],
    props.lineClamp !== undefined ? lineClampClassName(props.lineClamp) : "",
    { truncate: props.truncate },
  );

export type SingleTextNode =
  | string
  | number
  | false
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  | ReactElement<any, string | JSXElementConstructor<any>>
  | null
  | undefined;

export type RenderableSingleTextNode =
  | string
  | number
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  | ReactElement<any, string | JSXElementConstructor<any>>;

export type TextNode = SingleTextNode | Iterable<TextNode>;
export type RenderableTextNode = TextNode | Iterable<RenderableTextNode>;

export const singleTextNodeCanRender = (node: SingleTextNode): node is RenderableSingleTextNode => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return false;
  }
  return (
    (isValidElement(node) || typeof node === "string" || typeof node === "number") &&
    !isFragment(node)
  );
};

export type TypographyVisibilityState = "expanded" | "collapsed";

export const isTailwindFontSizeValue = (value: string) =>
  Object.keys(tailwindConfig.theme.fontSize).includes(value);
