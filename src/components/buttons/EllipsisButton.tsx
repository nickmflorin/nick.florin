import { forwardRef } from "react";

import { type IconButtonProps, IconButton } from "./generic";

export interface EllipsisButtonProps
  extends Omit<IconButtonProps<{ as: "button" }>, "options" | "icon"> {}

export const EllipsisButton = forwardRef<HTMLButtonElement, EllipsisButtonProps>(
  (props: EllipsisButtonProps, ref): JSX.Element => (
    <IconButton.Secondary
      {...props}
      ref={ref}
      options={{ as: "button" }}
      icon={{ name: "ellipsis-h" }}
    />
  ),
);
