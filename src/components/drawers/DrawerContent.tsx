import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface DrawerContentProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DrawerContent = ({ children, ...props }: DrawerContentProps) => (
  <div {...props} className={clsx("drawer__content", props.className)}>
    {children}
  </div>
);
