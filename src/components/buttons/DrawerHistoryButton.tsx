import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerHistoryButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "options" | "iconSize" | "size"> {
  readonly direction: "back" | "forward";
}

export const DrawerHistoryButton = forwardRef<HTMLButtonElement, DrawerHistoryButtonProps>(
  ({ direction, ...props }, ref): JSX.Element => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      as="button"
      size="xsmall"
      iconSize="large"
      icon={{ name: direction === "back" ? "arrow-left" : "arrow-right", iconStyle: "solid" }}
    />
  ),
);

export default DrawerHistoryButton;
