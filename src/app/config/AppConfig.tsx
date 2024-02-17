import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { ClerkProvider } from "./ClerkProvider";

const ClientConfig = dynamic(() => import("./ClientConfig"), { ssr: false });

export interface AppConfigProps {
  readonly children: ReactNode;
}

export const AppConfig = ({ children }: AppConfigProps): JSX.Element => (
  <ClerkProvider>
    <ClientConfig>{children}</ClientConfig>
  </ClerkProvider>
);
