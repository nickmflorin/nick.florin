import dynamic from "next/dynamic";

import { Drawer, type DrawerProps } from "./Drawer";
import { DrawerContainer } from "./DrawerContainer";
import { type DrawerId } from "./types";

const DrawerPortal = dynamic(() => import("./DrawerPortal"));
const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

export interface ClientDrawerProps extends DrawerProps {
  readonly id: DrawerId;
  readonly onClose: () => void;
}

export const ClientDrawer = ({
  id,
  children,
  onClose,
  ...props
}: ClientDrawerProps): JSX.Element => (
  <DrawerPortal id={id}>
    <DrawerContainer id={id}>
      <Drawer {...props}>
        {children}
        <DrawerCloseButton onClick={onClose} />
      </Drawer>
    </DrawerContainer>
  </DrawerPortal>
);

export default ClientDrawer;
