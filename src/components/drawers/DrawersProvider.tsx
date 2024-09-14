"use client";
import React, { type ReactNode } from "react";

import { DrawersContext } from "./context";
import { useDrawersManager } from "./hooks/use-drawers-manager";

export const DrawersProvider = ({ children }: { readonly children: ReactNode }) => {
  const manager = useDrawersManager();
  return (
    <DrawersContext.Provider value={{ ...manager, isInScope: true }}>
      {children}
    </DrawersContext.Provider>
  );
};

export default DrawersProvider;
