import { type ForwardedRef, forwardRef } from "react";

import { UnreachableCaseError } from "~/application/errors";

import type {
  TypographyCharacteristics,
  ComponentProps,
  AnyTypographyComponent,
  TypographyRef,
} from "~/components/types";
import {
  omitTypographyProps,
  getTypographyClassName,
  getTypographyStyle,
  classNames,
} from "~/components/types";

export type BaseTypographyProps<C extends AnyTypographyComponent> = TypographyCharacteristics &
  ComponentProps &
  Omit<React.ComponentProps<C>, "ref" | keyof ComponentProps | keyof TypographyCharacteristics> & {
    readonly component: C;
  };

/**
 * An abstract typography component that is not meant to be used directly, but rather as a base
 * for other typography components to extend from.
 */
export const BaseTypography = forwardRef(
  <C extends AnyTypographyComponent>(
    { component, ...props }: BaseTypographyProps<C>,
    ref: TypographyRef<C>,
  ): JSX.Element => {
    const ps = {
      ...omitTypographyProps(props),
      style: { ...getTypographyStyle(props), ...props.style },
      className: classNames(getTypographyClassName(props), props.className),
    };

    switch (component) {
      case "h1":
        return (
          <h1
            {...(ps as React.ComponentProps<"h1">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "h2":
        return (
          <h2
            {...(ps as React.ComponentProps<"h2">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "h3":
        return (
          <h3
            {...(ps as React.ComponentProps<"h3">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "h4":
        return (
          <h4
            {...(ps as React.ComponentProps<"h4">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "h5":
        return (
          <h5
            {...(ps as React.ComponentProps<"h5">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "h6":
        return (
          <h6
            {...(ps as React.ComponentProps<"h6">)}
            ref={ref as ForwardedRef<HTMLHeadingElement>}
          />
        );
      case "span":
        return (
          <span
            {...(ps as React.ComponentProps<"span">)}
            ref={ref as ForwardedRef<HTMLSpanElement>}
          />
        );
      case "div":
        return (
          <div {...(ps as React.ComponentProps<"div">)} ref={ref as ForwardedRef<HTMLDivElement>} />
        );
      case "p":
        return (
          <p
            {...(ps as React.ComponentProps<"p">)}
            ref={ref as ForwardedRef<HTMLParagraphElement>}
          />
        );
      case "label":
        return (
          <label
            {...(ps as React.ComponentProps<"label">)}
            ref={ref as ForwardedRef<HTMLLabelElement>}
          />
        );
      default:
        throw new UnreachableCaseError();
    }
  },
) as {
  <C extends AnyTypographyComponent>(
    props: BaseTypographyProps<C> & { readonly ref?: TypographyRef<C> },
  ): JSX.Element;
};
