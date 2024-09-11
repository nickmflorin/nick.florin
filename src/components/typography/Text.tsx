import React, { forwardRef } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import {
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types/typography";

export type TextComponent = "span" | "div" | "p";

export interface TextProps extends TypographyCharacteristics, ComponentProps {
  readonly children: React.ReactNode;
  readonly as?: TextComponent;
  readonly flex?: boolean;
  readonly inherit?: boolean;
}

type TextComponentProps<T extends TextComponent> = Omit<HTMLElementProps<T>, keyof ComponentProps> &
  ComponentProps;

const Span = forwardRef<HTMLDivElement, TextComponentProps<"span">>(
  (props, ref): JSX.Element => (
    <span {...props} ref={ref} className={classNames(props.className)} />
  ),
);

const Div = forwardRef<HTMLDivElement, TextComponentProps<"div">>(
  (props, ref): JSX.Element => <div {...props} ref={ref} className={classNames(props.className)} />,
);

const P = forwardRef<HTMLDivElement, TextComponentProps<"p">>(
  (props, ref): JSX.Element => <p {...props} ref={ref} className={classNames(props.className)} />,
);

const Components = {
  p: P,
  span: Span,
  div: Div,
} as const;

/* I do not understand why HTMLDivElement works as a ref regardless of the component type prop, but
   it does - likely because it is the most restrictive. */
export const Text = forwardRef<HTMLDivElement, TextProps>(
  (
    { children, style, as = "div", flex = false, inherit = false, ...props }: TextProps,
    ref,
  ): JSX.Element => {
    const Component = Components[as];
    return (
      <Component
        style={style}
        ref={ref}
        className={classNames(
          "text",
          { "text--inherit": inherit },
          { span: as === "span" },
          { ["flex flex-row items-center"]: flex },
          getTypographyClassName(props),
          props.className,
        )}
      >
        {children}
      </Component>
    );
  },
);
