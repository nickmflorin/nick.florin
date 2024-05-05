import React, { forwardRef } from "react";

import clsx from "clsx";

import {
  type ComponentProps,
  type HTMLElementProps,
  withoutOverridingClassName,
} from "~/components/types";
import { isTailwindScreenSizeModifier } from "~/components/types/breakpoints";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/types/typography";

export type DescriptionComponent = "div" | "p";

export interface DescriptionNodeProps extends BaseTypographyProps, ComponentProps {
  readonly children: React.ReactNode;
  readonly as?: DescriptionComponent;
}

type DescriptionComponentProps<T extends DescriptionComponent> = Omit<
  HTMLElementProps<T>,
  keyof ComponentProps
> &
  ComponentProps;

const Div = forwardRef<HTMLDivElement, DescriptionComponentProps<"div">>(
  (props, ref): JSX.Element => <div {...props} ref={ref} className={clsx(props.className)} />,
);

const P = forwardRef<HTMLDivElement, DescriptionComponentProps<"p">>(
  (props, ref): JSX.Element => <p {...props} ref={ref} className={clsx(props.className)} />,
);

const Components = {
  p: P,
  div: Div,
} as const;

/* I do not understand why HTMLDivElement works as a ref regardless of the component type prop, but
   it does - likely because it is the most restrictive. */
export const DescriptionNode = forwardRef<HTMLDivElement, DescriptionNodeProps>(
  ({ children, style, as = "div", ...props }: DescriptionNodeProps, ref): JSX.Element => {
    const Component = Components[as];
    return (
      <Component
        style={style}
        ref={ref}
        className={clsx(
          "description",
          getTypographyClassName(props),
          {
            // TODO: Add these default font sizes to the SCSS file.
            [withoutOverridingClassName(
              "text-sm",
              props.className,
              ({ prefix, value, modifier }) =>
                !modifier && prefix === "text" && isTailwindScreenSizeModifier(value),
            )]: props.fontSize === undefined,
            [withoutOverridingClassName(
              "max-sm:text-xs",
              props.className,
              /* If there is any responsive modifier on the text size, do not apply the
               max-sm:text-xs class. */
              ({ prefix, value, modifier }) =>
                modifier !== undefined &&
                isTailwindScreenSizeModifier(modifier) &&
                prefix === "text" &&
                isTailwindScreenSizeModifier(value),
            )]: props.fontSize === undefined,
          },
          props.className,
        )}
      >
        {children}
      </Component>
    );
  },
);
