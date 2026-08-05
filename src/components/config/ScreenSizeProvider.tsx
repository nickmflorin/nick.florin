'use client';
import { type ReactNode } from 'react';

import { ScreenSizeSeedContext } from './context';

export interface ScreenSizeProviderProps {
  readonly children: ReactNode;
  /**
   * The viewport width (in pixels) that server rendering and the client's first render assume,
   * derived on the server from the request's User-Agent device class. The `useScreenSizes` hook
   * replaces it with the measured window width on mount, before the browser paints.
   */
  readonly seedWidth: number;
}

export const ScreenSizeProvider = ({ children, seedWidth }: ScreenSizeProviderProps) => (
  <ScreenSizeSeedContext value={seedWidth}>{children}</ScreenSizeSeedContext>
);
