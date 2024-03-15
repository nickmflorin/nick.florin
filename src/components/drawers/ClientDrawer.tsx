import dynamic from "next/dynamic";

import { Drawer, type DrawerProps } from "./Drawer";
import { DrawerContainer } from "./DrawerContainer";

const DrawerPortal = dynamic(() => import("./DrawerPortal"));
const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

export interface ClientDrawerProps extends DrawerProps {
  readonly onClose: () => void;
}

export const ClientDrawer = ({ children, onClose, ...props }: ClientDrawerProps): JSX.Element => (
  <DrawerPortal>
    <DrawerContainer>
      <Drawer {...props}>
        {children}
        <DrawerCloseButton onClick={onClose} />
      </Drawer>
    </DrawerContainer>
  </DrawerPortal>
);

export default ClientDrawer;
