import { type NavItem } from '~/application/pages';

export interface INavigationContext {
  readonly isActive: (item: Pick<NavItem, 'activePaths'>) => boolean;
  readonly isInScope: boolean;
  readonly isPending: (item: Pick<NavItem, 'activePaths' | 'path'>) => boolean;
  readonly pendingItem: null | Pick<NavItem, 'activePaths' | 'path'>;
  readonly setNavigating: (item: Pick<NavItem, 'activePaths' | 'path'>) => void;
}

export interface INavMenuContext {
  readonly close: () => void;
  readonly isInScope: boolean;
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly setIsOpen: (v: boolean) => void;
  readonly toggle: () => void;
}
