import { forwardRef } from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

export interface NativeInputProps
  extends Omit<HTMLElementProps<"input">, "disabled">,
    ComponentProps {
  readonly isDisabled?: boolean;
}

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(
  ({ isDisabled, ...props }: NativeInputProps, ref) => (
    <input
      {...props}
      disabled={isDisabled}
      className={clsx("native-input", props.className)}
      ref={ref}
    />
  ),
);
