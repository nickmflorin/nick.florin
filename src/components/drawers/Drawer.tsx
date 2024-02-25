import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { DrawerPortal } from "./DrawerPortal";

const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

export interface DrawerProps {
  readonly open: boolean;
  readonly children: ReactNode;
  readonly onClose?: () => void;
}

export const Drawer = ({ children, open, onClose }: DrawerProps): JSX.Element => (
  <DrawerPortal open={open}>
    <div className="drawer">
      {children}
      {onClose && <DrawerCloseButton onClick={onClose} />}
    </div>
  </DrawerPortal>
);

export default Drawer;
