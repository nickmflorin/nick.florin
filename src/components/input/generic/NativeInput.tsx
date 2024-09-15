import React, { forwardRef } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface NativeInputProps
  extends Omit<React.ComponentProps<"input">, "disabled" | keyof ComponentProps>,
    ComponentProps {
  readonly isDisabled?: boolean;
}

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(
  ({ isDisabled, ...props }: NativeInputProps, ref) => (
    <input
      {...props}
      disabled={isDisabled}
      className={classNames("native-input", props.className)}
      ref={ref}
    />
  ),
);
