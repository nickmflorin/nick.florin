import { usePathname } from "next/navigation";
import { useMemo, useState, useCallback } from "react";

import { type PathActive, pathIsActive } from "~/lib/paths";
import { type Path } from "~/lib/urls";
import { type IconProp } from "~/components/icons";
import { useDebouncedValue, useDeepEqualEffect } from "~/hooks";

export interface NavItem {
  readonly icon?: IconProp;
  readonly path: Path;
  readonly active: PathActive;
}

export const navItemIsActive = <N extends Pick<NavItem, "active" | "path">, C extends N>(
  { path, active, children }: N & { readonly children?: C[] },
  { pathname }: { pathname: string },
): boolean => {
  if (children === undefined || children.length === 0) {
    return pathIsActive(active, pathname);
  }
  const baseIsActive = navItemIsActive({ path, active }, { pathname });
  return baseIsActive || children.some(child => navItemIsActive(child, { pathname }));
};

export interface NavigatableProps<N extends Pick<NavItem, "active" | "path">> {
  readonly item: N;
}

export const useNavigatable = <N extends Pick<NavItem, "active" | "path">>({
  item: { active, path },
}: NavigatableProps<N>) => {
  const pathname = usePathname();

  /* A separate active state value that is used to indicate when a navigatable element has just been
     clicked, but the pathname has not been updated yet.  In this case, a loading indicator can be
     shown in the navigatable element to let the user know that the navigation is in the process of
     being performed. */
  const [_optimisticIsActive, _setActiveOptimistically] = useState(false);

  // An active state that is determined solely from the pathname.  This is the "real" active state.
  const isActive = useMemo(
    () => (pathname ? navItemIsActive({ path, active }, { pathname }) : false),
    [pathname, path, active],
  );

  /* When the "real" active state differs from the optimistic one, it means that the navigatable
     element has just been clicked but the navigation hasn't completed yet.  The delay of 200ms is
     to prevent flashing loading indicators from appearing when the navigation is immediate. */
  const [isPending] = useDebouncedValue(_optimisticIsActive && !isActive, 200);

  useDeepEqualEffect(() => {
    if (_optimisticIsActive) {
      /* Keep the optimistic active state in sync with the real active state after the navigation
         occurs. */
      _setActiveOptimistically(false);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [pathname]);

  const setActiveOptimistically = useCallback(() => {
    if (!isActive) {
      _setActiveOptimistically(true);
    }
  }, [isActive]);

  return {
    isActive: isActive,
    isPending,
    setActiveOptimistically,
    href: path,
  };
};
