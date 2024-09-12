import { forwardRef } from "react";

import { type IconButtonProps, IconButton } from "./generic";

export interface EllipsisButtonProps extends Omit<IconButtonProps<"button">, "options" | "icon"> {}

export const EllipsisButton = forwardRef<HTMLButtonElement, EllipsisButtonProps>(
  (props: EllipsisButtonProps, ref): JSX.Element => (
    <IconButton.Solid
      {...props}
      scheme="secondary"
      ref={ref}
      element="button"
      icon={{ name: "ellipsis-h" }}
    />
  ),
);
