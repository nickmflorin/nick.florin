import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface ShowButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const ShowButton = forwardRef<HTMLButtonElement, ShowButtonProps>(
  (props: ShowButtonProps, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="eye" ref={ref} />
  ),
);
