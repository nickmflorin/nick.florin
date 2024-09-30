import { type Dispatch, type SetStateAction, useRef, useState, type MutableRefObject } from "react";

import { isEqual } from "lodash-es";

type InitialState<S> = S | (() => S);

export const useResettableState = <S>(
  initialState: InitialState<S>,
): [S, Dispatch<SetStateAction<S>>, () => void, boolean, MutableRefObject<InitialState<S>>] => {
  const initial = useRef<InitialState<S>>(initialState);

  const [state, setState] = useState(initialState);

  const reset = () => {
    setState(initial.current);
  };

  return [state, setState, reset, !isEqual(state, initial.current), initial];
};
