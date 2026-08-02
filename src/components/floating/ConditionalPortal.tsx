import dynamic from 'next/dynamic';
import { type JSX, memo, type ReactNode } from 'react';

const FloatingPortal = dynamic(() => import('@floating-ui/react').then(mod => mod.FloatingPortal));

export const ConditionalPortal = memo(
  ({
    children,
    inPortal = false,
  }: {
    readonly children: ReactNode;
    readonly inPortal?: boolean;
  }): JSX.Element => {
    if (inPortal) {
      return <FloatingPortal>{children}</FloatingPortal>;
    }
    return <>{children}</>;
  },
);
