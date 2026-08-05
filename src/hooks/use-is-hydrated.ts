import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => undefined;

/**
 * Returns whether the component is rendering on a hydrated client: `false` during server
 * rendering and during the client's first, hydration render, and `true` for every render after
 * hydration completes.
 *
 * Implemented with {@link useSyncExternalStore} — whose server snapshot is `false` and client
 * snapshot is `true` — rather than the `useState` + `useEffect` mounted-flag pattern, which
 * requires a set-state call inside an effect. React re-renders subscribers with the client
 * snapshot immediately after hydration, which is exactly the mounted-flag behavior without the
 * effect.
 */
export const useIsHydrated = (): boolean =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
