import { forwardRef } from "react";

import {
  TitleFontSizeOrderMap,
  DiscreteFontSizes,
  type TypographyComponent,
  type TypographyRef,
} from "~/components/types";

import { Typography, type TypographyProps } from "./Typography";

export type TitleProps<C extends TypographyComponent<"title">> = Omit<
  TypographyProps<"title", C>,
  "variant" | "component"
> & {
  readonly component?: C;
};

export const Title = forwardRef(
  <C extends TypographyComponent<"title">>(
    { component, ...props }: TitleProps<C>,
    ref: TypographyRef<C>,
  ): JSX.Element => {
    let c: TypographyComponent<"title"> = component ?? "h3";
    /* If the font size is provided, but the component is not - default the component based on the
       corresponding font size. */
    if (props.fontSize && !component && DiscreteFontSizes.contains(props.fontSize)) {
      c = TitleFontSizeOrderMap[props.fontSize];
    }

    const ps = {
      ...props,
      component: c,
      variant: "title",
    } as TypographyProps<"title", C>;

    return <Typography {...ps} ref={ref} />;
  },
) as {
  <C extends TypographyComponent<"title">>(
    props: TitleProps<C> & { readonly ref?: TypographyRef<C> },
  ): JSX.Element;
};
