"use client";
import React, { type ReactNode } from "react";

import { MantineProvider } from "./MantineProvider";
import { SWRConfig } from "./SWRConfig";

export interface ClientConfigProps {
  readonly children: ReactNode;
}

export const ClientConfig = (props: ClientConfigProps) => (
  <SWRConfig>
    <MantineProvider>{props.children}</MantineProvider>
  </SWRConfig>
);

export default ClientConfig;
