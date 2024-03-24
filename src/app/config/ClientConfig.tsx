"use client";
import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import { DrawersProvider } from "~/components/drawers/provider/DrawersProvider";

import { SWRConfig } from "./SWRConfig";

const MantineProvider = dynamic(() => import("./MantineProvider"), { ssr: false });

export interface ClientConfigProps {
  readonly children: ReactNode;
}

function ClientConfig(props: ClientConfigProps) {
  return (
    <SWRConfig>
      <MantineProvider>
        <DrawersProvider>{props.children}</DrawersProvider>
      </MantineProvider>
    </SWRConfig>
  );
}

export default ClientConfig;
