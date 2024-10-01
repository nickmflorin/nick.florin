import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface RemoteButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const RemoteButton = forwardRef<HTMLButtonElement, RemoteButtonProps>((props, ref) => (
  <IconButton.Transparent {...props} scheme="light" icon="laptop-code" ref={ref} />
));
