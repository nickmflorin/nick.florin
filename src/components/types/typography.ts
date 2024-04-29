import { type ReactElement, type JSXElementConstructor, isValidElement } from "react";

import clsx from "clsx";
import { isFragment } from "react-is";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const BodyFontSizes = enumeratedLiterals(
  ["xxxs", "xxs", "xs", "sm", "smplus", "md", "lg", "xl"] as const,
  {},
);

export type BodyFontSize = EnumeratedLiteralsType<typeof BodyFontSizes>;
export type LabelFontSize = BodyFontSize;

export const TitleFontSizes = enumeratedLiterals(
  ["xxs", "xs", "sm", "md", "lg", "xl"] as const,
  {},
);
export type TitleFontSize = EnumeratedLiteralsType<typeof TitleFontSizes>;

export const FontWeights = enumeratedLiterals(
  ["light", "regular", "medium", "semibold", "bold"] as const,
  {},
);

export type FontWeight = EnumeratedLiteralsType<typeof FontWeights>;

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

export const TitleFontSizeOrderMap: { [key in TitleFontSize]: TitleOrder } = {
  xxs: 6,
  xs: 5,
  sm: 4,
  md: 3,
  lg: 2,
  xl: 1,
};

export const TextTransforms = enumeratedLiterals(
  ["uppercase", "lowercase", "capitalize", "underline"] as const,
  {},
);
export type TextTransform = EnumeratedLiteralsType<typeof TextTransforms>;

export const FontFamilies = enumeratedLiterals(["inter", "avenir", "roboto"] as const, {});
export type FontFamily = EnumeratedLiteralsType<typeof FontFamilies>;

export type LineClamp = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const lineClampClassName = (clamp: LineClamp = 0) => {
  if (clamp === 0) {
    return "";
  }
  return clsx("break-words", {
    "line-clamp-1": clamp === 1,
    "line-clamp-2": clamp === 2,
    "line-clamp-3": clamp === 3,
    "line-clamp-4": clamp === 4,
    "line-clamp-5": clamp === 5,
    "line-clamp-6": clamp === 6,
  });
};

export interface BaseTypographyProps<F extends BodyFontSize | TitleFontSize = BodyFontSize> {
  readonly fontSize?: F;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly transform?: TextTransform;
  readonly lineClamp?: LineClamp;
  readonly truncate?: boolean;
}

export const getTypographyClassName = (props: BaseTypographyProps): string =>
  clsx(
    props.fontSize && `font-size-${props.fontSize}`,
    props.fontFamily && `font-family-${props.fontFamily}`,
    props.transform && `text-transform-${props.transform}`,
    props.fontWeight && `font-weight-${props.fontWeight}`,
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
  return isValidElement(node) && !isFragment(node);
};

export type LineBreakSize = 1 | 2;

export type TypographyVisibilityState = "expanded" | "collapsed";
