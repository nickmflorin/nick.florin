"use client";
import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import { SWRConfig } from "./SWRConfig";

const DrawersProvider = dynamic(() => import("~/components/drawers/provider/DrawersProvider"), {
  ssr: false,
});
const MantineProvider = dynamic(() => import("./MantineProvider"), { ssr: false });
const TourProvider = dynamic(() => import("./TourProvider"), { ssr: false });
const GlobalNavigatableProvider = dynamic(() => import("./GlobalNavigatableProvider"), {
  ssr: false,
});
const NavMenuProvider = dynamic(() => import("./NavMenuProvider"), {
  ssr: false,
});

export interface ClientConfigProps {
  readonly children: ReactNode;
}

function ClientConfig(props: ClientConfigProps) {
  return (
    <SWRConfig>
      <MantineProvider>
        <GlobalNavigatableProvider>
          <NavMenuProvider>
            <DrawersProvider>
              <TourProvider>{props.children}</TourProvider>
            </DrawersProvider>
          </NavMenuProvider>
        </GlobalNavigatableProvider>
      </MantineProvider>
    </SWRConfig>
  );
}

export default ClientConfig;
