import dynamic from "next/dynamic";

import { ClientDrawer, type ClientDrawerProps } from "~/components/drawers/ClientDrawer";
import { Loading } from "~/components/views/Loading";

/* const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
     loading: () => <Loading loading={true} />,
   }); */

interface ServerDrawerWrapperProps extends Omit<ClientDrawerProps, "children"> {
  readonly children: JSX.Element;
}

export const ServerDrawerWrapper = ({ children, ...props }: ServerDrawerWrapperProps) => (
  <ClientDrawer {...props}>{children}</ClientDrawer>
);
