import { type ReactNode } from "react";

import { DrawerPortal } from "./DrawerPortal";

export interface DrawerProps {
  readonly open: boolean;
  readonly children: ReactNode;
  readonly onClose?: () => void;
}

export const Drawer = ({ children, open, onClose }: DrawerProps): JSX.Element => (
  <DrawerPortal open={open}>
    <div className="drawer-wrapper">
      {/* {onClose && <CloseButton className="drawer__close-button" onClick={onClose} />} */}
      {children}
    </div>
  </DrawerPortal>
);

export default Drawer;
