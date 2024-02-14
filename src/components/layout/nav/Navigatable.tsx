import { type Url } from "next/dist/shared/lib/router/router";
import { usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const isActive = useMemo(() => navItemIsActive(item, { pathname }), [pathname, item]);
  return (
    <>
      {children({
        isActive,
        href:
          typeof item.path === "string"
            ? {
                pathname: item.path,
              }
            : {
                pathname: item.path.pathname,
                query: searchParams.toString(),
              },
      })}
    </>
  );
};
