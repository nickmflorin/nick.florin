import { forwardRef, type ForwardedRef } from "react";

import { type TypographyRef, type TypographyComponent } from "~/components/types";

import { Typography, type TypographyProps } from "./Typography";

export type LabelProps<C extends TypographyComponent<"label">> = Omit<
  TypographyProps<"label", C>,
  "variant" | "component"
> & {
  readonly component?: C;
};

export const Label = forwardRef(
  <C extends TypographyComponent<"label">>(
    { component = "div" as C, ...props }: LabelProps<C>,
    ref: ForwardedRef<TypographyRef<C>>,
  ): JSX.Element => {
    const ps = {
      ...props,
      component,
      variant: "label",
    } as TypographyProps<"label", C>;

    return <Typography {...ps} ref={ref as TypographyRef<C>} />;
  },
) as {
  <C extends TypographyComponent<"label">>(
    props: LabelProps<C> & { readonly ref?: TypographyRef<C> },
  ): JSX.Element;
};
