import { usePathname } from "next/navigation";
import { useMemo, useCallback, useEffect } from "react";

import { pathIsActive, type NavItem } from "~/application/pages";

import { useDebouncedValue } from "./use-debounced-value";
import { useGlobalNavigatable } from "./use-global-navigatable";

export interface NavigatableProps<N extends Pick<NavItem, "activePaths" | "path">> {
  readonly id: string;
  readonly item: N;
}

export const useNavigatable = <N extends Pick<NavItem, "activePaths" | "path">>({
  id,
  item: { activePaths, path },
}: NavigatableProps<N>) => {
  const { isOptimisticallyActive: _isOptimisticallyActive, setOptimisticActiveNavigation } =
    useGlobalNavigatable();

  const pathname = usePathname();

  const isOptimisticallyActive = useMemo(
    () => _isOptimisticallyActive(id),
    [id, _isOptimisticallyActive],
  );

  // An active state that is determined solely from the pathname.  This is the "real" active state.
  const isActive = useMemo(
    () => (pathname ? pathIsActive(activePaths, pathname) : false),
    [pathname, activePaths],
  );

  /* When the "real" active state differs from the optimistic one, it means that the navigatable
     element has just been clicked but the navigation hasn't completed yet.  The delay of 200ms is
     to prevent flashing loading indicators from appearing when the navigation is immediate. */
  const [isPending] = useDebouncedValue(isOptimisticallyActive && !isActive, 200);

  useEffect(() => {
    if (isOptimisticallyActive) {
      /* Keep the optimistic active state in sync with the real active state after the navigation
         occurs. */
      setOptimisticActiveNavigation(null);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [pathname]);

  const setActiveOptimistically = useCallback(() => {
    if (!isActive) {
      setOptimisticActiveNavigation(id);
    }
  }, [id, isActive, setOptimisticActiveNavigation]);

  return {
    isActive: isActive,
    isPending,
    setActiveOptimistically,
    href: path,
  };
};
