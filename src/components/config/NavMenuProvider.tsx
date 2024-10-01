"use client";
import React, { type ReactNode, useState } from "react";

import { MobileNavigationCutoff } from "~/components/constants";
import { useWindowResize } from "~/hooks";

import { NavMenuContext } from "./context";

export const NavMenuProvider = ({ children }: { readonly children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  useWindowResize(w => {
    if (w.innerWidth > MobileNavigationCutoff) {
      setIsOpen(false);
    }
  });

  return (
    <NavMenuContext.Provider
      value={{
        isOpen,
        isInScope: true,
        close: () => setIsOpen(false),
        open: () => setIsOpen(true),
        toggle: () => setIsOpen(v => !v),
        setIsOpen,
      }}
    >
      {children}
    </NavMenuContext.Provider>
  );
};

export default NavMenuProvider;
