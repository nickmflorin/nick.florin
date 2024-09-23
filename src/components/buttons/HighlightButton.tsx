import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface HighlightButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const HighlightButton = forwardRef<HTMLButtonElement, HighlightButtonProps>((props, ref) => (
  <IconButton.Transparent {...props} scheme="light" icon="star" ref={ref} />
));
