import { forwardRef } from "react";

import clsx from "clsx";

import { IconButton, type IconButtonProps } from "./generic";

export interface DialogCloseButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "options" | "iconSize" | "size"> {}

export const DialogCloseButton = forwardRef<HTMLButtonElement, DialogCloseButtonProps>(
  (props: DialogCloseButtonProps, ref): JSX.Element => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      as="button"
      size="xsmall"
      iconSize="large"
      icon={{ name: "xmark", iconStyle: "solid" }}
      className={clsx("dialog__close-button", props.className)}
    />
  ),
);

export default DialogCloseButton;
