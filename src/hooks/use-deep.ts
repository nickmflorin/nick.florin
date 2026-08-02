import { type DependencyList, type EffectCallback, useEffect, useRef } from 'react';

import { isEqual } from 'lodash-es';

/**
 * The explicit initial value passed to {@link useRef}, since React 19 requires this argument even
 * when the ref has no meaningful initial value of its own.
 */
const NoInitialRefValue = undefined;

/**
 * A {@link useEffect} that compares its dependencies by deep equality rather than by identity.
 *
 * React compares dependencies by identity and offers no way to override that, so the comparison is
 * performed by an effect that deliberately declares no dependency array at all.  That effect runs
 * after every commit, deeply compares the dependencies against the ones the effect last ran with,
 * and invokes the caller's effect only when they actually differ.
 *
 * The dependencies, the caller's effect and the cleanup it returned are all held in refs, which are
 * only ever read and written from inside effects, so that none of this bookkeeping happens while
 * rendering.
 *
 * @param {EffectCallback} effect The effect to run when the dependencies deeply change.
 * @param {DependencyList} deps The dependencies to compare by deep equality.
 */
export const useDeepEqualEffect = (effect: EffectCallback, deps: DependencyList): void => {
  const effectRef = useRef(effect);
  const depsRef = useRef<DependencyList | undefined>(NoInitialRefValue);
  const cleanupRef = useRef<ReturnType<EffectCallback>>(NoInitialRefValue);

  useEffect(() => {
    effectRef.current = effect;
  });

  useEffect(() => {
    if (!isEqual(deps, depsRef.current)) {
      depsRef.current = deps;
      cleanupRef.current?.();
      cleanupRef.current = effectRef.current();
    }
  });

  useEffect(() => () => cleanupRef.current?.(), []);
};
