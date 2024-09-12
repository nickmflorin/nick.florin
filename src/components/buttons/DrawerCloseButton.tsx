import { classNames } from "~/components/types";

import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerCloseButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "options" | "iconSize" | "size"> {}

export const DrawerCloseButton = (props: DrawerCloseButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    element="button"
    size="xsmall"
    iconSize="large"
    className={classNames("drawer__close-button", props.className)}
    icon={{ name: "xmark", iconStyle: "solid" }}
  />
);

export default DrawerCloseButton;
