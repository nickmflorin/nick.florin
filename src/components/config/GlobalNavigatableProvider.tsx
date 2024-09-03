"use client";
import React, { type ReactNode } from "react";

import { GlobalNavigatingContext } from "./context";
import { useGlobalNavigatableContext } from "./hooks/use-global-navigatable-context";

export const GlobalNavigatableProvider = ({ children }: { readonly children: ReactNode }) => {
  const context = useGlobalNavigatableContext();
  return (
    <GlobalNavigatingContext.Provider value={{ ...context, isInScope: true }}>
      {children}
    </GlobalNavigatingContext.Provider>
  );
};

export default GlobalNavigatableProvider;
