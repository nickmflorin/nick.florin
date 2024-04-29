import clsx from "clsx";

import type { ComponentProps, BaseTypographyProps } from "~/components/types";
import { getTypographyClassName } from "~/components/types";

export interface LabelProps extends BaseTypographyProps, ComponentProps {
  readonly children: string | number | undefined | null | false;
}

export const Label = ({ children, style, ...props }: LabelProps): JSX.Element => (
  <label style={style} className={clsx("label", getTypographyClassName(props), props.className)}>
    {children}
  </label>
);
