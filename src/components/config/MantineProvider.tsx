import { type ReactNode } from 'react';

import { MantineProvider as RootMantineProvider } from '@mantine/core';

export const MantineProvider = ({ children }: { readonly children: ReactNode }) => (
  <RootMantineProvider forceColorScheme='light'>{children}</RootMantineProvider>
);
