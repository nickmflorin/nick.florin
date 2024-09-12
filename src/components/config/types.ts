export interface GlobalNavigatableContext {
  readonly isInScope: boolean;
  readonly optimisticallyActiveNavigation: string | null;
  readonly isOptimisticallyActive: (id: string) => boolean;
  readonly setOptimisticActiveNavigation: (id: string | null) => void;
}

export interface INavMenuContext {
  readonly isInScope: boolean;
  readonly isOpen: boolean;
  readonly setIsOpen: (v: boolean) => void;
}
