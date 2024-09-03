import { useState, useCallback } from "react";

import { type GlobalNavigatableContext } from "~/components/config/types";

export const useGlobalNavigatableContext = (): Omit<GlobalNavigatableContext, "isInScope"> => {
  const [optimisticallyActiveNavigation, setOptimisticActiveNavigation] = useState<string | null>(
    null,
  );

  const isOptimisticallyActive = useCallback(
    (id: string) => optimisticallyActiveNavigation === id,
    [optimisticallyActiveNavigation],
  );

  return {
    optimisticallyActiveNavigation,
    setOptimisticActiveNavigation,
    isOptimisticallyActive,
  };
};
