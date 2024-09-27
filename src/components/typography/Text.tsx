import { forwardRef, type ForwardedRef } from "react";

import { type TypographyRef, type TypographyComponent } from "~/components/types";

import { Typography, type TypographyProps } from "./Typography";

export type TextProps<C extends TypographyComponent<"text">> = Omit<
  TypographyProps<"text", C>,
  "variant" | "component"
> & {
  readonly component?: C;
};

export const Text = forwardRef(
  <C extends TypographyComponent<"text">>(
    { component = "div" as C, ...props }: TextProps<C>,
    ref: ForwardedRef<TypographyRef<C>>,
  ): JSX.Element => {
    const ps = {
      ...props,
      component,
      variant: "text",
    } as TypographyProps<"text", C>;

    return <Typography {...ps} ref={ref as TypographyRef<C>} />;
  },
) as {
  <C extends TypographyComponent<"text">>(
    props: TextProps<C> & { readonly ref?: TypographyRef<C> },
  ): JSX.Element;
};
