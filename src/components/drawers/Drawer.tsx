import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Drawer = ({ children, ...props }: DrawerProps): JSX.Element => (
  <div {...props} className={clsx("drawer", props.className)}>
    {children}
  </div>
);

export default Drawer;
