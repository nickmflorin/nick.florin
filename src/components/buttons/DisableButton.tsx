import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DisableButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const DisableButton = forwardRef<HTMLButtonElement, DisableButtonProps>(
  (props: DisableButtonProps, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="volume-xmark" ref={ref} />
  ),
);
