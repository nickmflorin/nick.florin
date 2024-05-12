import { forwardRef } from "react";

import clsx from "clsx";

import { IconButton, type IconButtonProps } from "./generic";

export interface ClearButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "options" | "iconSize" | "size"> {}

export const ClearButton = forwardRef<HTMLButtonElement, ClearButtonProps>(
  (props: ClearButtonProps, ref): JSX.Element => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      as="button"
      size="xsmall"
      iconSize="16px"
      icon={{ name: "circle-xmark", iconStyle: "solid" }}
      className={clsx("text-gray-500 disabled:text-gray-200", props.className)}
    />
  ),
);

export default ClearButton;
