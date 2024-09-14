import { createContext } from "react";

import { type INavMenuContext, type INavigationContext } from "./types";

export const NavigationContext = createContext<INavigationContext>({
  isInScope: false,
  pendingItem: null,
  isPending: () => false,
  isActive: () => false,
  setNavigating: () => {},
});

export const NavMenuContext = createContext<INavMenuContext>({
  isInScope: false,
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  setIsOpen: () => {},
});
