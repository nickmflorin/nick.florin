import { type JSX, memo, type ReactNode } from 'react';

/* Imported statically: '@floating-ui/react' is already in the client bundle via the floating
   hooks, so a lazy import here saves nothing - and because it mounted only when a floating
   element opened, its suspension escaped to the nearest route Suspense boundary, blinking that
   boundary's entire subtree to its fallback on every tooltip or popover open. */
import { FloatingPortal } from '@floating-ui/react';

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
