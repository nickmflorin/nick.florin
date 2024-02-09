import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type InputSize, InputSizes, InputVariants, type InputVariant } from "./types";

export interface InputProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
  readonly disabled?: boolean;
}

export const Input = ({
  children,
  disabled = false,
  size = InputSizes.MEDIUM,
  variant = InputVariants.PRIMARY,
  ...props
}: InputProps) => (
  <div
    {...props}
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
);
