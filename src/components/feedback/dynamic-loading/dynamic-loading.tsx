import { type ReactNode, useState } from "react";

import { DynamicLoadingContext } from "./context";

export interface DynamicLoadingProps {
  readonly children: (params: { isLoading: boolean }) => ReactNode;
}

/**
 * A component that, when used in conjunction with {@link DynamicLoader}, can show a loading state
 * in a component that is adjacent to or a parent of a component that is being dynamically loaded,
 * while that dynamically loaded component is loading.
 *
 * @example
 *
 * ```tsx
 * import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";
 *
 * const Modal = dynamic(() => import("~/components/Modal"), { loading: () => <DynamicLoader /> });
 *
 * const MyModalButton = () => {
 *   const [modalOpen, setModalOpen] = useState(false);
 *
 *   return (
 *     <DynamicLoading>
 *       {({ isLoading }) => (
 *         <Button isLoading={isLoading}>Open Modal</Button>
 *         {modalOpen && <Modal />}
 *       )}
 *     </DynamicLoading>
 *    )
 * }
 * ```
 */
export const DynamicLoading = ({ children }: DynamicLoadingProps) => {
  const [isDynamicallyLoading, setIsDynamicallyLoading] = useState(false);

  return (
    <DynamicLoadingContext.Provider value={setIsDynamicallyLoading}>
      {children({ isLoading: isDynamicallyLoading })}
    </DynamicLoadingContext.Provider>
  );
};
