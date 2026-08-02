import { createContext } from 'react';

import { noop } from 'lodash-es';

import { type INavigationContext, type INavMenuContext, type IUserProfileContext } from './types';

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
