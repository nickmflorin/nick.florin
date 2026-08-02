import { type JSX, type ReactNode } from 'react';

import { CookiesProvider as RootCookiesProvider } from 'next-client-cookies/server';

export const CookiesProvider = ({ children }: { readonly children: ReactNode }): JSX.Element => (
  <RootCookiesProvider>{children}</RootCookiesProvider>
);
