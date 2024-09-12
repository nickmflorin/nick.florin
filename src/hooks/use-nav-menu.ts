import { useContext } from "react";

import { NavMenuContext } from "~/components/config/context";

export const useNavMenu = () => {
  const ctx = useContext(NavMenuContext);
  if (!ctx.isInScope) {
    throw new Error("The 'useNavMenu' hook must be called within the 'NavMenuContext'!");
  }
  return ctx;
};
