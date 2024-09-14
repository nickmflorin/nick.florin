import { useMemo, useCallback } from "react";

import { type NavItem } from "~/application/pages";

import { useNavigation } from "./use-navigation";

export const useNavigationItem = <N extends Pick<NavItem, "activePaths" | "path">>(item: N) => {
  const {
    isPending: _isPending,
    isActive: _isActive,
    setNavigating: _setNavigating,
  } = useNavigation();

  const isPending = useMemo(() => _isPending(item), [item, _isPending]);

  const isActive = useMemo(() => _isActive(item), [item, _isActive]);

  const setNavigating = useCallback(() => {
    _setNavigating(item);
  }, [item, _setNavigating]);

  return {
    isPending,
    isActive,
    setNavigating,
    href: item.path,
  };
};
