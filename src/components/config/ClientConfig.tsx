"use client";
import React, { type ReactNode } from "react";

import { NextUIProvider } from "@nextui-org/react";

import { MantineProvider } from "./MantineProvider";
import { SWRConfig } from "./SWRConfig";

export interface ClientConfigProps {
  readonly children: ReactNode;
}

export const ClientConfig = (props: ClientConfigProps) => (
  <SWRConfig>
    <NextUIProvider>
      <MantineProvider>{props.children}</MantineProvider>
    </NextUIProvider>
  </SWRConfig>
);

export default ClientConfig;
