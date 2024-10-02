import { type Dispatch, type SetStateAction, useMemo } from "react";

import { isEqual, uniq } from "lodash-es";

import { useResettableState } from "./use-resettable-state";

type InitialState<S extends Record<string, unknown>> = S | (() => S);

/**
 * @deprecated
 * This should be replaced with logic that can be incorporated into the 'useFilters' or
 * 'useFilters' hooks.
 */
export const useFilterState = <S extends Record<string, unknown>>(
  initialState: InitialState<S>,
  comparators?: Partial<{ [key in keyof S]: (a: S[key], b: S[key]) => boolean }>,
): [S, Dispatch<SetStateAction<S>>, () => void, boolean, (keyof S)[]] => {
  const [state, setState, reset, hasChanged, initial] = useResettableState(initialState);

  const differingFilters = useMemo(() => {
    const keys = uniq([...Object.keys(state), ...Object.keys(initial.current)]) as Array<keyof S>;
    const current = typeof initial.current === "function" ? initial.current() : initial.current;
    return keys.filter(k => {
      const comparator = comparators?.[k] ?? isEqual;
      return !comparator(state[k], current[k]);
    });
  }, [state, comparators, initial]);

  return [state, setState, reset, hasChanged, differingFilters];
};
