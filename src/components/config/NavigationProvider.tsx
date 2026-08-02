'use client';
import { usePathname } from 'next/navigation';
import { type ReactNode, useCallback, useState } from 'react';

import { type NavItem, pathIsActive } from '~/application/pages';

import { useDebouncedValue } from '~/hooks';

import { NavigationContext } from './context';

/**
 * The delay, in milliseconds, before a pending navigation is treated as in-flight and its loading
 * indicator is shown.
 *
 * When the "real" active state (determined from the pathname) differs from the optimistic one, it
 * means that the navigable element has just been clicked but the navigation has not completed yet.
 * This delay prevents the loading indicator from flashing when the navigation is immediate.
 */
const NavigationPendingDelayMs = 200;

/**
 * Determines the optimistic and pending navigation state that should be set when a navigable
 * element identified by `item` is clicked, given whether that element is already active.
 *
 * When the clicked element is already active, both states must be cleared rather than left as they
 * are. This is because, if another element is pending navigation when an already active element is
 * clicked, the click cancels that pending navigation without the pathname ever changing, so the
 * effect that clears pending state on navigation would never run - leaving the other element stuck
 * with an infinite loading indicator.
 */
const getNavigationStateOnClick = (
  item: Pick<NavItem, 'activePaths' | 'path'>,
  isActive: boolean,
): [null | Pick<NavItem, 'activePaths' | 'path'>, null | Pick<NavItem, 'activePaths' | 'path'>] =>
  isActive ? [null, null] : [item, item];

export const NavigationProvider = ({ children }: { readonly children: ReactNode }) => {
  const [clickedNavigation, setClickedNavigation] = useState<null | Pick<
    NavItem,
    'activePaths' | 'path'
  >>(null);
  const [clickedPendingNavigation, setClickedPendingNavigation] = useState<null | Pick<
    NavItem,
    'activePaths' | 'path'
  >>(null);

  const pathname = usePathname();

  const isActive = useCallback(
    (item: Pick<NavItem, 'activePaths'>) =>
      pathname ? pathIsActive(item.activePaths, pathname) : false,
    [pathname],
  );

  /* Once the pathname catches up with the element that was clicked, the navigation has completed
     and neither the optimistic nor the pending state describes anything anymore.  Both are
     discarded here, as the navigation lands, rather than being cleared from an effect after it. */
  const hasNavigationLanded = (item: null | Pick<NavItem, 'activePaths'>): boolean =>
    item !== null && isActive(item);

  const optimisticallyActiveNavigation = hasNavigationLanded(clickedNavigation)
    ? null
    : clickedNavigation;
  const pendingNavigation = hasNavigationLanded(clickedPendingNavigation)
    ? null
    : clickedPendingNavigation;

  const isOptimisticallyActive = useCallback(
    (item: Pick<NavItem, 'path'>) =>
      optimisticallyActiveNavigation !== null && optimisticallyActiveNavigation.path === item.path,
    [optimisticallyActiveNavigation],
  );

  const [pendingItem] = useDebouncedValue(pendingNavigation, NavigationPendingDelayMs);

  const isPending = useCallback(
    (item: Pick<NavItem, 'activePaths' | 'path'>) =>
      pendingItem !== null &&
      pendingItem.path === item.path &&
      isOptimisticallyActive(item) &&
      !isActive(item),
    [pendingItem, isOptimisticallyActive, isActive],
  );

  const setNavigating = useCallback(
    (item: Pick<NavItem, 'activePaths' | 'path'>) => {
      const [optimistic, pending] = getNavigationStateOnClick(item, isActive(item));
      setClickedNavigation(optimistic);
      setClickedPendingNavigation(pending);
    },
    [isActive],
  );

  return (
    <NavigationContext value={{ isActive, isInScope: true, isPending, pendingItem, setNavigating }}>
      {children}
    </NavigationContext>
  );
};
