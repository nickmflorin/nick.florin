import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface RemoveFromTopSkillsButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const RemoveFromTopSkillsButton = forwardRef<
  HTMLButtonElement,
  RemoveFromTopSkillsButtonProps
>((props: RemoveFromTopSkillsButtonProps, ref) => (
  <IconButton.Transparent {...props} scheme="light" icon="eraser" ref={ref} />
));
