import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerCloseButtonProps extends IconButtonProps<{ as: "button" }> {}

export const DrawerCloseButton = ({ onClick, ...props }: DrawerCloseButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    options={{ as: "button" }}
    size="xsmall"
    iconSize="large"
    icon={{ name: "xmark", iconStyle: "solid" }}
    className="drawer__close-button text-gray-500 hover:text-gray-600 hover:bg-gray-200"
    onClick={onClick}
  />
);

export default DrawerCloseButton;
