import { type ReactNode } from "react";

import { DrawerPortal } from "./DrawerPortal";

export interface DrawerProps {
  readonly open: boolean;
  readonly children: ReactNode;
}

export const Drawer = ({ children, open }: DrawerProps): JSX.Element => (
  <DrawerPortal open={open}>
    <div className="drawer">
      <div className="drawer__content">{children}</div>
    </div>
  </DrawerPortal>
);

export default Drawer;
