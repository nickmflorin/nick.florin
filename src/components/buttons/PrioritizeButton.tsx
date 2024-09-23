import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface PrioritizeButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const PrioritizeButton = forwardRef<HTMLButtonElement, PrioritizeButtonProps>(
  (props, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="arrow-up-1-9" ref={ref} />
  ),
);
