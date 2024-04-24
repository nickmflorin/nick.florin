import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerCloseButtonProps
  extends Omit<IconButtonProps<{ as: "button" }>, "icon" | "options" | "iconSize" | "size"> {}

export const DrawerCloseButton = (props: DrawerCloseButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    options={{ as: "button" }}
    size="xsmall"
    iconSize="large"
    icon={{ name: "xmark", iconStyle: "solid" }}
  />
);

export default DrawerCloseButton;
