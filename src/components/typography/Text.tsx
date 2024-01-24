import React from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import { type FontWeight, type TypographySize } from "~/components/typography";

export interface TextProps extends ComponentProps {
  readonly children: React.ReactNode;
  readonly span?: true;
  readonly size?: TypographySize;
  readonly truncate?: boolean;
  readonly fontWeight?: FontWeight;
  readonly lineClamp?: number;
}

const Span = (
  props: Omit<HTMLElementProps<"span">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <span {...props} className={clsx(props.className)} />;

const Div = (
  props: Omit<HTMLElementProps<"div">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <div {...props} className={clsx(props.className)} />;

export const Text = ({
  children,
  size,
  fontWeight,
  style,
  span,
  lineClamp,
  truncate = false,
  ...props
}: TextProps): JSX.Element => {
  const Component = span ? Span : Div;
  return (
    <Component
      style={lineClamp ? { ...style, lineClamp } : style}
      className={clsx(
        "body",
        { span },
        size && `font-size-${size}`,
        fontWeight && `font-weight-${fontWeight}`,
        { truncate: truncate, clamp: lineClamp !== undefined },
        props.className,
      )}
    >
      {children}
    </Component>
  );
};
