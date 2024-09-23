import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface AddToTopSkillsButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const AddToTopSkillsButton = forwardRef<HTMLButtonElement, AddToTopSkillsButtonProps>(
  (props: AddToTopSkillsButtonProps, ref) => (
    <IconButton.Transparent {...props} scheme="light" icon="star" ref={ref} />
  ),
);
