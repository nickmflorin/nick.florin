import clsx from "clsx";

import { IconButton, type IconButtonProps } from "./IconButton";

export interface SidebarAnchorProps extends Omit<IconButtonProps<{ as: "link" }>, "options"> {
  readonly isActive: boolean;
}

export const SidebarAnchor = (props: SidebarAnchorProps) => (
  <IconButton {...props} className={clsx("w-full h-auto", props.className)} />
);
