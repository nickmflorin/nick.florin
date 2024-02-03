import clsx from "clsx";

import { type BaseTypographyProps, getTypographyClassName } from "./types";

export interface LabelProps extends BaseTypographyProps {
  readonly children: string | number | undefined | null | false;
}

export const Label = ({ children, style, ...props }: LabelProps): JSX.Element => (
  <label style={style} className={clsx("label", getTypographyClassName(props))}>
    {children}
  </label>
);
