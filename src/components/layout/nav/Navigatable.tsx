import { type Url } from "next/dist/shared/lib/router/router";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { type NavItem, navItemIsActive } from "./types";

export interface NavigatableProps<N extends Pick<NavItem, "active" | "path">> {
  readonly item: N;
  readonly children: (props: { isActive: boolean; href: Url }) => ReactNode;
}

export const Navigatable = <N extends Pick<NavItem, "active" | "path">>({
  item,
  children,
}: NavigatableProps<N>) => {
  const pathname = usePathname();
  const isActive = useMemo(
    () => (pathname ? navItemIsActive(item, { pathname }) : false),
    [pathname, item],
  );
  return (
    <>
      {children({
        isActive,
        href: item.path,
      })}
    </>
  );
};
