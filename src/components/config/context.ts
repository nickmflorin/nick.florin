import { createContext } from "react";

import { type GlobalNavigatableContext } from "./types";

export const GlobalNavigatingContext = createContext<GlobalNavigatableContext>({
  isInScope: false,
  optimisticallyActiveNavigation: null,
  isOptimisticallyActive: () => false,
  setOptimisticActiveNavigation: () => {},
});
