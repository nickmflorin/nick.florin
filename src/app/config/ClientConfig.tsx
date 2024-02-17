"use client";
import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import { SWRConfig } from "./SWRConfig";

const MantineProvider = dynamic(() => import("./MantineProvider"), { ssr: false });

export interface ClientConfigProps {
  readonly children: ReactNode;
}

function ClientConfig(props: ClientConfigProps) {
  return (
    <SWRConfig>
      <MantineProvider>{props.children}</MantineProvider>
    </SWRConfig>
  );
}

export default ClientConfig;
