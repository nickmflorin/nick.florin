import { type ReactNode, useEffect, useEffectEvent } from 'react';

import { Portal } from '@mui/base';

import { useIsHydrated } from '~/hooks/use-is-hydrated';

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
  const isHydrated = useIsHydrated();

  useCloseOnContextDrawerOpen(contextDrawerId, onClose);

  /* The portal resolves its container from the DOM, so it cannot be rendered until the client has
     hydrated - this component server-renders alongside the client component that mounts it. */
  if (!isHydrated) {
    return null;
  }
  return (
    <Portal container={document.getElementById('drawer-target')}>
      <DrawerWrapper drawerId={drawerId} onClose={onClose}>
        {/* The wrapper stays mounted and empties rather than unmounting, so that the
            AnimatePresence inside it survives the close and can play the drawer's exit animation.
            A context drawer takes precedence over a portal drawer, so opening one empties this
            one as well - and now does so through the same animation. */}
        {children && contextDrawerId === null ? (
          <DrawerContainer>{children}</DrawerContainer>
        ) : null}
      </DrawerWrapper>
    </Portal>
  );
};
