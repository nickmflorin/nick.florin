"use client";
import React, { type ReactNode } from "react";
import { useState } from "react";

import { useNavMenu } from "~/hooks";

import { UserProfileContext } from "./context";

export const UserProfileProvider = ({ children }: { readonly children: ReactNode }) => {
  const { close: closeNavMenu } = useNavMenu();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UserProfileContext.Provider
      value={{
        isOpen,
        close: () => setIsOpen(false),
        open: () => {
          setIsOpen(true);
          setTimeout(() => {
            closeNavMenu();
          });
        },
        isInScope: true,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;
