import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface UnhighlightButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const UnhighlightButton = forwardRef<HTMLButtonElement, UnhighlightButtonProps>(
  (props, ref) => <IconButton.Transparent {...props} scheme="light" icon="ban" ref={ref} />,
);
