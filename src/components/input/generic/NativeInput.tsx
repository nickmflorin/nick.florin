import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";

export interface NativeInputProps extends HTMLElementProps<"input">, ComponentProps {}

export const NativeInput = ({ ...props }: NativeInputProps) => (
  <input {...props} className={clsx("native-input", props.className)} />
);
