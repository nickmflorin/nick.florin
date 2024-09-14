import { type ReactNode } from "react";

import { type ComponentProps, classNames } from "~/components/types";

export interface DrawerFooterProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DrawerFooter = ({ children, ...props }: DrawerFooterProps) => (
  <div {...props} className={classNames("drawer__footer", props.className)}>
    {children}
  </div>
);
