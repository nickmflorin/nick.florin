import { forwardRef, type ReactNode } from "react";

import {
  type ComponentProps,
  classNames,
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types";
import { omitTypographyProps } from "~/components/types";

export interface LabelProps
  extends TypographyCharacteristics,
    ComponentProps,
    Omit<React.ComponentProps<"label">, keyof ComponentProps> {
  readonly children: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, ...props }: LabelProps, ref): JSX.Element => (
    <label
      {...omitTypographyProps(props)}
      ref={ref}
      className={classNames("label", getTypographyClassName(props), props.className)}
    >
      {children}
    </label>
  ),
);
