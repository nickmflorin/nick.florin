import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DeprioritizeButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const DeprioritizeButton = forwardRef<HTMLButtonElement, DeprioritizeButtonProps>(
  (props, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="arrow-down-1-9" ref={ref} />
  ),
);
