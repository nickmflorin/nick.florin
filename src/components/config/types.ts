import type { NavItem } from "~/application/pages";

export interface INavigationContext {
  readonly isInScope: boolean;
  readonly pendingItem: Pick<NavItem, "activePaths" | "path"> | null;
  readonly isActive: (item: Pick<NavItem, "activePaths">) => boolean;
  readonly isPending: (item: Pick<NavItem, "activePaths" | "path">) => boolean;
  readonly setNavigating: (item: Pick<NavItem, "activePaths" | "path">) => void;
}

export interface INavMenuContext {
  readonly isInScope: boolean;
  readonly isOpen: boolean;
  readonly close: () => void;
  readonly open: () => void;
  readonly toggle: () => void;
  readonly setIsOpen: (v: boolean) => void;
}

export interface IUserProfileContext {
  readonly isInScope: boolean;
  readonly isOpen: boolean;
  readonly close: () => void;
  readonly open: () => void;
}
