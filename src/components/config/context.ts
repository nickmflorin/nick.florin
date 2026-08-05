import { createContext } from 'react';

import { noop } from 'lodash-es';

import { ViewportSeedWidths } from '~/application/viewport';

import { type INavigationContext, type INavMenuContext, type IUserProfileContext } from './types';

/**
 * Holds the viewport width (in pixels) that server rendering — and the client's first, hydration
 * render — should assume, before the real window has been measured.
 *
 * The value is seeded per-request from the device class the middleware infers from the
 * User-Agent (see `~/application/viewport.ts`). The default covers consumers rendered outside
 * `ScreenSizeProvider`, which assume a desktop viewport.
 */
export const ScreenSizeSeedContext = createContext<number>(ViewportSeedWidths.desktop);

export const NavigationContext = createContext<INavigationContext>({
  isActive: () => false,
  isInScope: false,
  isPending: () => false,
  pendingItem: null,
  setNavigating: noop,
});

export const NavMenuContext = createContext<INavMenuContext>({
  close: noop,
  isInScope: false,
  isOpen: false,
  open: noop,
  setIsOpen: noop,
  toggle: noop,
});

export const UserProfileContext = createContext<IUserProfileContext>({
  close: noop,
  isInScope: false,
  isOpen: false,
  open: noop,
});
