import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { DrawerPortal } from "./DrawerPortal";

const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

export interface DrawerProps extends ComponentProps {
  readonly open: boolean;
  readonly children: ReactNode;
  readonly onClose?: () => void;
}

export const Drawer = ({ children, open, onClose, ...props }: DrawerProps): JSX.Element => (
  <DrawerPortal open={open}>
    <div {...props} className={clsx("drawer", props.className)}>
      {children}
      {onClose && <DrawerCloseButton onClick={onClose} />}
    </div>
  </DrawerPortal>
);

export default Drawer;
