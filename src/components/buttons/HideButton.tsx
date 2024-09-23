import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface HideButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const HideButton = forwardRef<HTMLButtonElement, HideButtonProps>(
  (props: HideButtonProps, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="eye-slash" ref={ref} />
  ),
);
