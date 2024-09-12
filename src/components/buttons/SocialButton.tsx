import { classNames } from "~/components/types";

import { type IconButtonProps, IconButton } from "./generic";

export interface SocialButtonProps extends Omit<IconButtonProps<"a">, "options" | "iconSize"> {}

export const SocialButton = (props: SocialButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    element="a"
    size="22px"
    className={classNames("h-[22px] w-[22px] min-h-[22px] text-gray-500", props.className)}
    iconSize="full"
  />
);
