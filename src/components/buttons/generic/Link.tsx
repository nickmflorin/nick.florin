import type * as types from "../types";

import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

import { AbstractButton } from "./AbstractButton";

export type LinkProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  BaseTypographyProps;

const Base = AbstractButton as React.FC<types.AbstractProps<"link", types.ButtonOptions>>;

export const Link = <O extends types.ButtonOptions>({
  children,
  transform,
  fontFamily,
  size,
  fontWeight,
  ...props
}: LinkProps<O>) => {
  const ps = {
    ...props,
    buttonType: "link",
  } as types.AbstractProps<"link", O>;
  return (
    <Base
      {...ps}
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
};
