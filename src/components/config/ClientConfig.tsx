'use client';
import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

import { DrawersProvider } from '~/components/drawers/DrawersProvider';

import { MantineProvider } from './MantineProvider';
import { NavigationProvider } from './NavigationProvider';
import { NavMenuProvider } from './NavMenuProvider';
import { SWRConfig } from './SWRConfig';
import { UserProfileProvider } from './UserProfileProvider';

/*
The tour provider is the one provider that warrants code-splitting: it pulls in '@reactour/tour'
and the tour's step content (skill badges included), which the initial bundle should not pay for.
It is deliberately NOT loaded with `ssr: false` — a provider excluded from server rendering
excludes everything nested under it (the entire page) from the server-rendered HTML.
*/
const TourProvider = dynamic(() => import('./TourProvider').then(mod => mod.TourProvider));

export interface ClientConfigProps {
  readonly children: ReactNode;
}

export const ClientConfig = (props: ClientConfigProps) => (
  <SWRConfig>
    <MantineProvider>
      <NavigationProvider>
        <NavMenuProvider>
          <UserProfileProvider>
            <DrawersProvider>
              <TourProvider>{props.children}</TourProvider>
            </DrawersProvider>
          </UserProfileProvider>
        </NavMenuProvider>
      </NavigationProvider>
    </MantineProvider>
  </SWRConfig>
);
