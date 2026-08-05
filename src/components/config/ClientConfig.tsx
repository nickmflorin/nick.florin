'use client';
import { type ReactNode } from 'react';

import { DrawersProvider } from '~/components/drawers/DrawersProvider';

import { MantineProvider } from './MantineProvider';
import { NavigationProvider } from './NavigationProvider';
import { NavMenuProvider } from './NavMenuProvider';
import { ScreenSizeProvider } from './ScreenSizeProvider';
import { SWRConfig } from './SWRConfig';
import { UserProfileProvider } from './UserProfileProvider';

export interface ClientConfigProps {
  readonly children: ReactNode;
  readonly initialViewportWidth: number;
}

export const ClientConfig = (props: ClientConfigProps) => (
  <ScreenSizeProvider seedWidth={props.initialViewportWidth}>
    <SWRConfig>
      <MantineProvider>
        <NavigationProvider>
          <NavMenuProvider>
            <UserProfileProvider>
              <DrawersProvider>{props.children}</DrawersProvider>
            </UserProfileProvider>
          </NavMenuProvider>
        </NavigationProvider>
      </MantineProvider>
    </SWRConfig>
  </ScreenSizeProvider>
);
