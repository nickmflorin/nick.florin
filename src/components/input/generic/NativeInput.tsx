import { forwardRef } from "react";

import { classNames } from "~/components/types";
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
      className={classNames("native-input", props.className)}
      ref={ref}
    />
  ),
);
