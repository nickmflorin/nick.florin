import { forwardRef } from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { type InputSize, InputSizes, InputVariants, type InputVariant } from "./types";

export interface InputProps
  extends ComponentProps,
    Pick<HTMLElementProps<"div">, "onFocus" | "onBlur"> {
  readonly children: JSX.Element;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
  readonly disabled?: boolean;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      children,
      disabled = false,
      size = InputSizes.MEDIUM,
      variant = InputVariants.PRIMARY,
      ...props
    }: InputProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "input",
        `input--size-${size}`,
        `input--variant-${variant}`,
        { disabled },
        props.className,
      )}
    >
      {children}
    </div>
  ),
);
