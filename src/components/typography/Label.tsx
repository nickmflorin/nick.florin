import clsx from "clsx";

import type { ComponentProps } from "~/components/types";

import { type BaseTypographyProps, getTypographyClassName } from "./types";

export interface LabelProps extends BaseTypographyProps, ComponentProps {
  readonly children: string | number | undefined | null | false;
}

export const Label = ({ children, style, ...props }: LabelProps): JSX.Element => (
  <label style={style} className={clsx("label", getTypographyClassName(props), props.className)}>
    {children}
  </label>
);
