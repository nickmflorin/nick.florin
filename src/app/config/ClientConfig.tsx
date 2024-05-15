"use client";
import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import { SWRConfig } from "./SWRConfig";

const DrawersProvider = dynamic(() => import("~/components/drawers/provider/DrawersProvider"), {
  ssr: false,
});
const MantineProvider = dynamic(() => import("./MantineProvider"), { ssr: false });
const TourProvider = dynamic(() => import("./TourProvider"), { ssr: false });

export interface ClientConfigProps {
  readonly children: ReactNode;
}

function ClientConfig(props: ClientConfigProps) {
  return (
    <SWRConfig>
      <MantineProvider>
        <DrawersProvider>
          <TourProvider>{props.children}</TourProvider>
        </DrawersProvider>
      </MantineProvider>
    </SWRConfig>
  );
}

export default ClientConfig;
