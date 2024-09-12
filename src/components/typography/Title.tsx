import { forwardRef, type ForwardedRef } from "react";

import { isFragment } from "react-is";

import {
  type ComponentProps,
  type HTMLElementProps,
  classNames,
  type TypographyCharacteristics,
  getTypographyClassName,
  type TitleComponent,
  TitleFontSizeOrderMap,
  type FontSize,
} from "~/components/types";

type PolymorphicTitleProps<C extends TitleComponent> = Omit<
  HTMLElementProps<C>,
  keyof ComponentProps
>;

export type TitleProps<C extends TitleComponent> = TypographyCharacteristics &
  ComponentProps &
  PolymorphicTitleProps<C> & {
    readonly component?: TitleComponent;
  };

export const Title = forwardRef<HTMLHeadingElement, TitleProps<TitleComponent>>(
  <C extends TitleComponent>(
    {
      component,
      fontSize,
      fontWeight,
      transform,
      fontFamily,
      lineClamp,
      truncate,
      align,
      ...props
    }: TitleProps<C>,
    ref: ForwardedRef<HTMLHeadingElement>,
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
    let c: TitleComponent = component ?? "h3";
    const fz: FontSize | undefined = fontSize;
    /* If the font size is provided, but the component is not - default the component based on the
       corresponding font size. */
    if (fontSize && !component) {
      c = TitleFontSizeOrderMap[fontSize];
    }

    const ps = {
      ...props,
      className: classNames(
        "title",
        getTypographyClassName({
          fontSize: fz,
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

    switch (c) {
      case "h1":
        return <h1 {...ps} ref={ref} />;
      case "h2":
        return <h2 {...ps} ref={ref} />;
      case "h3":
        return <h3 {...ps} ref={ref} />;
      case "h4":
        return <h4 {...ps} ref={ref} />;
      case "h5":
        return <h5 {...ps} ref={ref} />;
      case "h6":
        return <h6 {...ps} ref={ref} />;
    }
  },
);
