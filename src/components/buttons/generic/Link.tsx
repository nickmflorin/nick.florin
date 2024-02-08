import { forwardRef } from "react";

import type * as types from "../types";

import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

import { AbstractButton } from "./AbstractButton";

export type LinkProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  BaseTypographyProps;

const Base = AbstractButton as React.FC<types.AbstractProps<"link", types.ButtonOptions>>;

export const Link = forwardRef(
  <O extends types.ButtonOptions>(
    { children, transform, fontFamily, size, fontWeight, ...props }: LinkProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      buttonType: "link",
    } as types.AbstractProps<"link", O>;
    return (
      <Base
        {...ps}
        ref={ref}
        className={getTypographyClassName({
          size,
          fontFamily,
          fontWeight,
          transform,
        })}
      >
        {children}
      </Base>
    );
  },
) as {
  <O extends types.ButtonOptions>(
    props: LinkProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};
