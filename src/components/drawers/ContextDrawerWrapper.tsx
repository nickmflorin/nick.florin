'use client';
import { DrawerWrapper } from './DrawerWrapper';
import { useDrawers } from './hooks/use-drawers';

export const ContextDrawerWrapper = () => {
  const { close, drawer, drawerId } = useDrawers();
  return (
    <DrawerWrapper drawerId={drawerId} onClose={close}>
      {drawer}
    </DrawerWrapper>
  );
};
