import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));
import { DrawerContainer } from "./DrawerContainer";

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly onClose?: () => void;
}

export const Drawer = ({ children, onClose, ...props }: DrawerProps): JSX.Element => (
  <DrawerContainer>
    <div {...props} className={clsx("drawer", props.className)}>
      {children}
      {onClose && <DrawerCloseButton onClick={onClose} />}
    </div>
  </DrawerContainer>
);

export default Drawer;
