import { type Dispatch, type SetStateAction, useState } from 'react';

import { isEqual } from 'lodash-es';

type InitialState<S> = (() => S) | S;

/**
 * A {@link useState} that also exposes the state it was initialized with, a way to reset back to
 * it, and whether the current state has diverged from it.
 *
 * The initial state is held alongside the current state rather than in a ref, so that the
 * divergence between the two can be determined while rendering without reading a ref.  It is
 * resolved once, on the first render, and never changes afterwards.
 *
 * @param {InitialState<S>} initialState
 *   The initial state, or a function that produces it.
 *
 * @returns {[S, Dispatch<SetStateAction<S>>, () => void, boolean, S]}
 *   The state, its setter, a function that resets it, whether it has diverged from the initial
 *   state, and the initial state itself.
 */
export const useResettableState = <S>(
  initialState: InitialState<S>,
): [S, Dispatch<SetStateAction<S>>, () => void, boolean, S] => {
  const [resettable, setResettable] = useState<{ current: S; initial: S }>(() => {
    const resolved = initialState instanceof Function ? initialState() : initialState;
    return { current: resolved, initial: resolved };
  });

  const setState: Dispatch<SetStateAction<S>> = value =>
    setResettable(curr => ({
      ...curr,
      current: value instanceof Function ? value(curr.current) : value,
    }));

  const reset = () => setResettable(curr => ({ ...curr, current: curr.initial }));

  return [
    resettable.current,
    setState,
    reset,
    !isEqual(resettable.current, resettable.initial),
    resettable.initial,
  ];
};
