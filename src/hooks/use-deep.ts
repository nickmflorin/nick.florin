import { useRef, useEffect, useMemo, type DependencyList } from "react";

import { isEqual } from "lodash-es";

export const useDeepEqualMemo: typeof useMemo = (fn, deps) => {
  /* React 19 requires an explicit initial value for useRef. */
  const ref = useRef<DependencyList | undefined>(undefined);
  const signalRef = useRef<number>(0);

  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  return useMemo(fn, [signalRef.current]);
};

export const useDeepEqualEffect: typeof useEffect = (effect, deps) => {
  /* React 19 requires an explicit initial value for useRef. */
  const ref = useRef<DependencyList | undefined>(undefined);
  const signalRef = useRef<number>(0);

  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  return useEffect(effect, [signalRef.current]);
};
