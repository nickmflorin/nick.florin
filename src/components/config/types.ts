export interface GlobalNavigatableContext {
  readonly isInScope: boolean;
  readonly optimisticallyActiveNavigation: string | null;
  readonly isOptimisticallyActive: (id: string) => boolean;
  readonly setOptimisticActiveNavigation: (id: string | null) => void;
}
