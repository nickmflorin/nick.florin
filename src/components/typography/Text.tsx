import React, { forwardRef, type ForwardedRef } from "react";

import { isFragment } from "react-is";

import {
  type ComponentProps,
  type TypographyCharacteristics,
  getTypographyClassName,
  classNames,
} from "~/components/types";

export type TextComponent = "span" | "div" | "p";

type PolymorphicTextProps<T extends TextComponent> = Omit<
  React.ComponentProps<T>,
  keyof ComponentProps | "ref"
>;

type PolymorphicTextRef<T extends TextComponent> = {
  div: ForwardedRef<HTMLDivElement>;
  p: ForwardedRef<HTMLParagraphElement>;
  span: ForwardedRef<HTMLSpanElement>;
}[T];

export type TextProps<C extends TextComponent> = TypographyCharacteristics &
  ComponentProps &
  PolymorphicTextProps<C> & {
    readonly component?: TextComponent;
    readonly flex?: boolean;
    readonly inherit?: boolean;
    readonly isDisabled?: boolean;
  };

export const Text = forwardRef<HTMLDivElement, TextProps<TextComponent>>(
  <C extends TextComponent>(
    {
      component = "div",
      flex = false,
      inherit = false,
      isDisabled = false,
      fontSize,
      fontWeight,
      transform,
      fontFamily,
      lineClamp,
      truncate,
      align,
      ...props
    }: TextProps<C>,
    ref: PolymorphicTextRef<C>,
  ): JSX.Element => {
    if (
      isFragment(props.children) ||
      props.children === undefined ||
      props.children === null ||
      typeof props.children === "boolean" ||
      (typeof props.children === "string" && props.children === "")
    ) {
      return <></>;
    }
    const ps = {
      ...props,
      className: classNames(
        "body",
        {
          "body--inherit": inherit,
          ["flex flex-row items-center"]: flex,
          "text-disabled": isDisabled,
        },
        getTypographyClassName({
          fontSize,
          fontWeight,
          transform,
          fontFamily,
          lineClamp,
          truncate,
          align,
        }),
        props.className,
      ),
    };
    switch (component) {
      case "span": {
        const p = ps as React.ComponentProps<"span">;
        return <span {...p} ref={ref as PolymorphicTextRef<"span">} />;
      }
      case "div": {
        const p = ps as React.ComponentProps<"div">;
        return <div {...p} ref={ref as PolymorphicTextRef<"div">} />;
      }
      case "p": {
        const p = ps as React.ComponentProps<"p">;
        return <p {...p} ref={ref as PolymorphicTextRef<"p">} />;
      }
    }
  },
) as {
  <C extends TextComponent>(
    props: TextProps<C> & { readonly ref?: PolymorphicTextRef<C> },
  ): JSX.Element;
};
