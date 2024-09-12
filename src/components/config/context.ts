import { createContext } from "react";

import { type INavMenuContext, type GlobalNavigatableContext } from "./types";

export const GlobalNavigatingContext = createContext<GlobalNavigatableContext>({
  isInScope: false,
  optimisticallyActiveNavigation: null,
  isOptimisticallyActive: () => false,
  setOptimisticActiveNavigation: () => {},
});

export const NavMenuContext = createContext<INavMenuContext>({
  isInScope: false,
  isOpen: false,
  setIsOpen: () => {},
});
