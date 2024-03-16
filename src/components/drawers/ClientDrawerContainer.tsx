import dynamic from "next/dynamic";

import { type DrawerProps } from "./Drawer";
import { DrawerContainer, type DrawerContainerProps } from "./DrawerContainer";

const DrawerPortal = dynamic(() => import("./DrawerPortal"));

export interface ClientDrawerContainerProps extends DrawerContainerProps {
  readonly onClose: () => void;
}

export const ClientDrawerContainer = ({
  children,
  ...props
}: ClientDrawerContainerProps): JSX.Element => (
  <DrawerPortal>
    <DrawerContainer {...props}>{children}</DrawerContainer>
  </DrawerPortal>
);

export default ClientDrawerContainer;
