import { type ReactNode, type JSX } from "react";

import { CookiesProvider as RootCookiesProvider } from "next-client-cookies/server";

export const CookiesProvider = ({ children }: { children: ReactNode }): JSX.Element => (
  <RootCookiesProvider>{children}</RootCookiesProvider>
);

export default CookiesProvider;
