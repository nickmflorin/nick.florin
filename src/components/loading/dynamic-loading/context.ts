import { createContext } from 'react';

export type DynamicLoadingContextType = (v: boolean) => void;

/* eslint-disable-next-line @typescript-eslint/no-empty-function -- A no-op default is required
   for consumers that are rendered outside of a provider. */
export const DynamicLoadingContext = createContext<DynamicLoadingContextType>(() => {});
