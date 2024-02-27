import clsx from "clsx";

import { type IconButtonProps, IconButton } from "./generic";

export interface SocialButtonProps
  extends Omit<IconButtonProps<{ as: "a" }>, "options" | "iconSize"> {}

export const SocialButton = (props: SocialButtonProps): JSX.Element => (
  <IconButton.Bare
    {...props}
    options={{ as: "a" }}
    className={clsx("text-gray-500 hover:text-blue-600", props.className)}
    iconSize="full"
  />
);
