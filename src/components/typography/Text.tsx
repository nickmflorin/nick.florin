import React from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { type BaseTypographyProps, getTypographyClassName } from "./types";

export interface TextProps extends BaseTypographyProps {
  readonly children: React.ReactNode;
  readonly span?: true;
  readonly truncate?: boolean;
  readonly lineClamp?: number;
  readonly flex?: boolean;
  readonly inherit?: boolean;
}

const Span = (
  props: Omit<HTMLElementProps<"span">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <span {...props} className={clsx(props.className)} />;

const Div = (
  props: Omit<HTMLElementProps<"div">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <div {...props} className={clsx(props.className)} />;

export const Text = ({
  children,
  style,
  span,
  lineClamp,
  flex = false,
  truncate = false,
  inherit = false,
  ...props
}: TextProps): JSX.Element => {
  const Component = span ? Span : Div;
  return (
    <Component
      style={lineClamp ? { ...style, lineClamp } : style}
      className={clsx(
        "body",
        { "body--inherit": inherit },
        { span },
        { ["flex flex-row items-center"]: flex },
        {
          truncate: truncate,
          clamp: lineClamp !== undefined,
        },
        getTypographyClassName(props),
      )}
    >
      {children}
    </Component>
  );
};
