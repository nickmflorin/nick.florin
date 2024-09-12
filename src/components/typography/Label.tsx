import { forwardRef, type ReactNode } from "react";

import {
  type ComponentProps,
  type HTMLElementProps,
  classNames,
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types";

export interface LabelProps
  extends TypographyCharacteristics,
    ComponentProps,
    Omit<HTMLElementProps<"label">, keyof ComponentProps> {
  readonly children: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      fontSize,
      fontWeight,
      transform,
      fontFamily,
      lineClamp,
      truncate,
      align,
      ...props
    }: LabelProps,
    ref,
  ): JSX.Element => (
    <label
      {...props}
      ref={ref}
      className={classNames(
        "label",
        getTypographyClassName({
          fontSize,
          fontWeight,
          transform,
          fontFamily,
          lineClamp,
          truncate,
          align,
        }),
        props.className,
      )}
    >
      {children}
    </label>
  ),
);
