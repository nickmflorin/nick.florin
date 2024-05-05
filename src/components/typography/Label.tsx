import clsx from "clsx";

import type { ComponentProps } from "~/components/types";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/types/typography";

export interface LabelProps extends BaseTypographyProps, ComponentProps {
  readonly children: React.ReactNode;
}

export const Label = ({ children, style, ...props }: LabelProps): JSX.Element => (
  <label style={style} className={clsx("label", getTypographyClassName(props), props.className)}>
    {children}
  </label>
);
