"use client";
import React, { type ReactNode, useState } from "react";

import { NavMenuContext } from "./context";

export const NavMenuProvider = ({ children }: { readonly children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavMenuContext.Provider value={{ isOpen, setIsOpen, isInScope: true }}>
      {children}
    </NavMenuContext.Provider>
  );
};

export default NavMenuProvider;
