import { forwardRef } from "react";

import { classNames } from "~/components/types";

import { IconButton, type IconButtonProps } from "./generic";

export interface ClearButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "options" | "iconSize" | "size" | "element"> {}

export const ClearButton = forwardRef<HTMLButtonElement, ClearButtonProps>(
  (props: ClearButtonProps, ref): JSX.Element => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      element="button"
      size="xsmall"
      iconSize="16px"
      icon={{ name: "circle-xmark", iconStyle: "solid" }}
      className={classNames("text-gray-500 disabled:text-gray-200", props.className)}
    />
  ),
);

export default ClearButton;
