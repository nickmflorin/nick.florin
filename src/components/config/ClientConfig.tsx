"use client";
import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import { SWRConfig } from "./SWRConfig";

const DrawersProvider = dynamic(() => import("~/components/drawers/DrawersProvider"), {
  ssr: false,
});
const MantineProvider = dynamic(() => import("./MantineProvider"), { ssr: false });
const TourProvider = dynamic(() => import("./TourProvider"), { ssr: false });
const NavigationProvider = dynamic(() => import("./NavigationProvider"), {
  ssr: false,
});
const NavMenuProvider = dynamic(() => import("./NavMenuProvider"), {
  ssr: false,
});
const UserProfileProvider = dynamic(() => import("./UserProfileProvider"), {
  ssr: false,
});

export interface ClientConfigProps {
  readonly children: ReactNode;
}

function ClientConfig(props: ClientConfigProps) {
  return (
    <SWRConfig>
      <MantineProvider>
        <NavigationProvider>
          <NavMenuProvider>
            <UserProfileProvider>
              <DrawersProvider>
                <TourProvider>{props.children}</TourProvider>
              </DrawersProvider>
            </UserProfileProvider>
          </NavMenuProvider>
        </NavigationProvider>
      </MantineProvider>
    </SWRConfig>
  );
}

export default ClientConfig;
