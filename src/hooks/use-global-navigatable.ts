import { useContext } from "react";

import { GlobalNavigatingContext } from "~/components/config/context";

export const useGlobalNavigatable = () => {
  const ctx = useContext(GlobalNavigatingContext);
  if (!ctx.isInScope) {
    throw new Error(
      "The 'useGlobalNavigatable' hook must be called within the 'GlobalNavigatableProvider'!",
    );
  }
  return ctx;
};
