'use client';
import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

import { SWRConfig } from './SWRConfig';

const DrawersProvider = dynamic(
  () => import('~/components/drawers/DrawersProvider').then(mod => mod.DrawersProvider),
  {
    ssr: false,
  },
);
const MantineProvider = dynamic(
  () => import('./MantineProvider').then(mod => mod.MantineProvider),
  { ssr: false },
);
const TourProvider = dynamic(() => import('./TourProvider').then(mod => mod.TourProvider), {
  ssr: false,
});
const NavigationProvider = dynamic(
  () => import('./NavigationProvider').then(mod => mod.NavigationProvider),
  {
    ssr: false,
  },
);
const NavMenuProvider = dynamic(
  () => import('./NavMenuProvider').then(mod => mod.NavMenuProvider),
  {
    ssr: false,
  },
);
const UserProfileProvider = dynamic(
  () => import('./UserProfileProvider').then(mod => mod.UserProfileProvider),
  {
    ssr: false,
  },
);

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
