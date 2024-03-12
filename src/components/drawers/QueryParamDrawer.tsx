"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { type DrawerParam, parseSearchParams } from "./types";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

export interface ClientDrawerProps {
  readonly children?: JSX.Element | JSX.Element[];
  readonly param: DrawerParam;
  readonly className?: ComponentProps["className"];
}

export const QueryParamDrawer = ({ children, param, ...props }: ClientDrawerProps) => {
  const searchParams = useSearchParams();
  const drawerParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  const paramValue = useMemo(() => drawerParams[param] ?? null, [drawerParams, param]);

  /* I do not understand why, but when the page is reloaded, refreshed, etc. while there is a
     drawer-related query parameter in the URL, the drawer will be initially visible on the page -
     but, when the close button is clicked, the query parameter is removed from the URL in the
     browser but the drawer does not close.

     This is because, for whatever reason, removing that query parameter does not cause the page
     to rerender.  As a temporary workaround, we simply ensure that the query parameter is present
     on the client side (as well on the server side page) before rendering the drawer, allowing the
     drawer to be closed when the query parameter is removed from the URL and the server side page
     does not rerender.

     This applies to all query paramter controlled drawers. */
  if (children && paramValue) {
    return (
      <Drawer {...props}>
        {children}
        <DrawerCloseButton param={param} />
      </Drawer>
    );
  }
  return null;
};

export default QueryParamDrawer;
