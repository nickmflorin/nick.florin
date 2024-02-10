import { forwardRef } from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

export interface NativeInputProps extends HTMLElementProps<"input">, ComponentProps {}

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(
  ({ ...props }: NativeInputProps, ref) => (
    <input {...props} className={clsx("native-input", props.className)} ref={ref} />
  ),
);
