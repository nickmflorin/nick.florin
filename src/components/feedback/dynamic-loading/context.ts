import { createContext } from "react";

export type DynamicLoadingContextType = (v: boolean) => void;

export const DynamicLoadingContext = createContext<DynamicLoadingContextType>(() => {});
