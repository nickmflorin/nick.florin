import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface EnableButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const EnableButton = forwardRef<HTMLButtonElement, EnableButtonProps>(
  (props: EnableButtonProps, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="volume-high" ref={ref} />
  ),
);
