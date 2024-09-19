import { type ReactNode, useEffect } from "react";

import { Portal } from "@mui/base";

import { DrawerContainer } from "./DrawerContainer";
import { DrawerWrapper } from "./DrawerWrapper";
import { useDrawers } from "./hooks/use-drawers";
import { type DrawerId } from "./types";

export interface PortalDrawerWrapperProps {
  readonly drawerId: DrawerId | null;
  readonly children: ReactNode;
  readonly onClose: () => void;
}

export const PortalDrawerWrapper = ({ drawerId, children, onClose }: PortalDrawerWrapperProps) => {
  const { drawerId: contextDrawerId } = useDrawers();

  useEffect(() => {
    if (contextDrawerId) {
      onClose();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [contextDrawerId]);

  return !contextDrawerId ? (
    <Portal container={document.getElementById("drawer-target")}>
      <DrawerWrapper drawerId={drawerId} onClose={onClose}>
        <DrawerContainer>{children}</DrawerContainer>
      </DrawerWrapper>
    </Portal>
  ) : (
    <></>
  );
};
