"use client";
import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";

import { Drawer, type DrawerProps } from "./Drawer";
import { useDrawerParam } from "./hooks";
import { type DrawerParam } from "./types";

export interface ServerDrawerProps extends Omit<DrawerProps, "children"> {
  readonly children?: JSX.Element | JSX.Element[];
  readonly param: DrawerParam;
}

export const ServerDrawer = ({ children, param, ...props }: ServerDrawerProps) => {
  const paramValue = useDrawerParam(param);

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

export default ServerDrawer;
