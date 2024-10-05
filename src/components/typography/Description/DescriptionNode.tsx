import React, { forwardRef, type ForwardedRef } from "react";

import { isFragment } from "react-is";

import {
  type ComponentProps,
  type TypographyCharacteristics,
  getTypographyClassName,
  classNames,
  getTypographyStyle,
  parseDataAttributes,
} from "~/components/types";
import { omitTypographyProps } from "~/components/types";

export type DescriptionComponent = "span" | "div" | "p";

type PolymorphicDescriptionProps<T extends DescriptionComponent> = Omit<
  React.ComponentProps<T>,
  keyof ComponentProps | "ref"
>;

type PolymorphicDescriptionRef<T extends DescriptionComponent> = {
  div: ForwardedRef<HTMLDivElement>;
  p: ForwardedRef<HTMLParagraphElement>;
  span: ForwardedRef<HTMLSpanElement>;
}[T];

export type DescriptionNodeProps<C extends DescriptionComponent> = TypographyCharacteristics &
  ComponentProps &
  PolymorphicDescriptionProps<C> & {
    readonly component?: DescriptionComponent;
    readonly inherit?: boolean;
  };

export const DescriptionNode = forwardRef<
  HTMLDivElement,
  DescriptionNodeProps<DescriptionComponent>
>(
  <C extends DescriptionComponent>(
    { component = "div", inherit = false, ...props }: DescriptionNodeProps<C>,
    ref: PolymorphicDescriptionRef<C>,
  ): JSX.Element => {
    if (
      isFragment(props.children) ||
      props.children === undefined ||
      props.children === null ||
      typeof props.children === "boolean" ||
      (typeof props.children === "string" && props.children.trim() === "")
    ) {
      return <></>;
    }
    const ps = {
      ...omitTypographyProps(props),
      ...parseDataAttributes({ inherit }),
      style: { ...getTypographyStyle(props), ...props.style },
      className: classNames(
        "description",
        getTypographyClassName(props),
        {
          [classNames("text-sm", props.className)]: props.fontSize === undefined,
          [classNames("max-sm:text-xs", props.className)]: props.fontSize === undefined,
        },
        props.className,
      ),
    };
    switch (component) {
      case "span": {
        const p = ps as React.ComponentProps<"span">;
        return <span {...p} ref={ref as PolymorphicDescriptionRef<"span">} />;
      }
      case "div": {
        const p = ps as React.ComponentProps<"div">;
        return <div {...p} ref={ref as PolymorphicDescriptionRef<"div">} />;
      }
      case "p": {
        const p = ps as React.ComponentProps<"p">;
        return <p {...p} ref={ref as PolymorphicDescriptionRef<"p">} />;
      }
    }
  },
) as {
  <C extends DescriptionComponent>(
    props: DescriptionNodeProps<C> & { readonly ref?: PolymorphicDescriptionRef<C> },
  ): JSX.Element;
};
