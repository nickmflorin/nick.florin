import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface InPersonButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const InPersonButton = forwardRef<HTMLButtonElement, InPersonButtonProps>((props, ref) => (
  <IconButton.Transparent {...props} scheme="light" icon="house-person-return" ref={ref} />
));
