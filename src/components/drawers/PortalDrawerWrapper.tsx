import { type ReactNode, useEffect, useEffectEvent } from 'react';

import { Portal } from '@mui/base';

import { DrawerContainer } from './DrawerContainer';
import { DrawerWrapper } from './DrawerWrapper';
import { useDrawers } from './hooks/use-drawers';
import { type DrawerId } from './types';

export interface PortalDrawerWrapperProps {
  readonly children: ReactNode;
  readonly drawerId: DrawerId | null;
  readonly onClose: () => void;
}

/**
 * Closes the drawer via `onClose` when a drawer is opened in context, and by nothing else.
 *
 * The handler is read through an effect event because it is not itself reactive - callers commonly
 * define it inline, so depending on it would close the drawer on every render.
 */
const useCloseOnContextDrawerOpen = (contextDrawerId: DrawerId | null, onClose: () => void) => {
  const close = useEffectEvent(() => onClose());

  useEffect(() => {
    if (contextDrawerId) {
      close();
    }
  }, [contextDrawerId]);
};

export const PortalDrawerWrapper = ({ children, drawerId, onClose }: PortalDrawerWrapperProps) => {
  const { drawerId: contextDrawerId } = useDrawers();

  useCloseOnContextDrawerOpen(contextDrawerId, onClose);

  return contextDrawerId ? null : (
    <Portal container={document.getElementById('drawer-target')}>
      <DrawerWrapper drawerId={drawerId} onClose={onClose}>
        <DrawerContainer>{children}</DrawerContainer>
      </DrawerWrapper>
    </Portal>
  );
};
