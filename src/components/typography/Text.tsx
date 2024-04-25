import React from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { type BaseTypographyProps, getTypographyClassName } from "./types";

export type TextComponent = "span" | "div" | "p";

export interface TextProps extends BaseTypographyProps, ComponentProps {
  readonly children: React.ReactNode;
  readonly as?: TextComponent;
  readonly truncate?: boolean;
  readonly flex?: boolean;
  readonly inherit?: boolean;
}

const Span = (
  props: Omit<HTMLElementProps<"span">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <span {...props} className={clsx(props.className)} />;

const Div = (
  props: Omit<HTMLElementProps<"div">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <div {...props} className={clsx(props.className)} />;

const P = (
  props: Omit<HTMLElementProps<"p">, keyof ComponentProps> & ComponentProps,
): JSX.Element => <p {...props} className={clsx(props.className)} />;

const Components = {
  p: P,
  span: Span,
  div: Div,
} as const;

const LocalText = ({
  children,
  style,
  as = "div",
  lineClamp,
  flex = false,
  inherit = false,
  ...props
}: TextProps): JSX.Element => {
  const Component = Components[as];
  return (
    <Component
      style={lineClamp ? { ...style, lineClamp, WebkitLineClamp: lineClamp } : style}
      className={clsx(
        "body",
        { "body--inherit": inherit },
        { span: as === "span" },
        { ["flex flex-row items-center"]: flex },
        getTypographyClassName(props),
        props.className,
      )}
    >
      {children}
    </Component>
  );
};

export const Text = Object.assign(LocalText, { displayName: "Text" });
