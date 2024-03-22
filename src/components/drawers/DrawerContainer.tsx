import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface DrawerContainerProps extends ComponentProps {
  readonly id: string;
  readonly children: ReactNode;
}

export const DrawerContainer = ({ children, ...props }: DrawerContainerProps) => (
  <div {...props} className={clsx("drawer-container", props.className)}>
    {children}
  </div>
);
