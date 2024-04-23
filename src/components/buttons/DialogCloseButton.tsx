import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DialogCloseButtonProps extends IconButtonProps<{ as: "button" }> {}

export const DialogCloseButton = forwardRef<HTMLButtonElement, DialogCloseButtonProps>(
  ({ onClick, ...props }: DialogCloseButtonProps, ref): JSX.Element => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      options={{ as: "button" }}
      size="xsmall"
      iconSize="large"
      icon={{ name: "xmark", iconStyle: "solid" }}
      className="dialog__close-button text-gray-500 hover:text-gray-600 hover:bg-gray-200"
      onClick={onClick}
    />
  ),
);

export default DialogCloseButton;
