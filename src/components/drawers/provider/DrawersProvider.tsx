"use client";
import React, { type ReactNode } from "react";

import { DrawersContext } from "./drawers-context";
import { useDrawersManager } from "./use-drawers-manager";

export const DrawersProvider = ({ children }: { readonly children: ReactNode }) => {
  const manager = useDrawersManager();
  return (
    <DrawersContext.Provider value={{ ...manager, isReady: true }}>
      {children}
    </DrawersContext.Provider>
  );
};

export default DrawersProvider;
