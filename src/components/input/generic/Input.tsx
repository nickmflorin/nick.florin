import { forwardRef } from "react";

import clsx from "clsx";

import { Spinner } from "~/components/icons/Spinner";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { type InputSize, InputSizes, InputVariants, type InputVariant } from "./types";

export interface InputProps
  extends ComponentProps,
    Pick<HTMLElementProps<"div">, "onFocus" | "onBlur"> {
  readonly children: JSX.Element;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      children,
      isDisabled = false,
      size = InputSizes.MEDIUM,
      isLoading = false,
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
        { disabled: isDisabled },
        props.className,
      )}
    >
      <div className="input__content">{children}</div>
      <Spinner isLoading={isLoading} size="14px" className="text-gray-500" />
    </div>
  ),
);
