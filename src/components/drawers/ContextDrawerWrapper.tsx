"use client";
import { DrawerWrapper } from "./DrawerWrapper";
import { useDrawers } from "./hooks/use-drawers";

export const ContextDrawerWrapper = () => {
  const { drawerId, drawer, close } = useDrawers();
  return (
    <DrawerWrapper drawerId={drawerId} onClose={close}>
      {drawer}
    </DrawerWrapper>
  );
};
