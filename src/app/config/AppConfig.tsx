import { type ReactNode } from "react";

import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";

import ClientConfig from "./ClientConfig";

export interface AppConfigProps {
  readonly children: ReactNode;
}

export const AppConfig = ({ children }: AppConfigProps): JSX.Element => (
  <ClerkProvider>
    <ClerkLoading>Loading Clerk...</ClerkLoading>
    <ClerkLoaded>
      <ClientConfig>{children}</ClientConfig>
    </ClerkLoaded>
  </ClerkProvider>
);
