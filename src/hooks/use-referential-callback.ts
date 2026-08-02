import { useCallback, useRef } from 'react';

type Callback<P extends unknown[], R> = (...args: P) => R;

/**
 * A hook that uses a {@link MutableRefObject} to store a function reference such that the function
 * can access the most up to date values in state or in the render cycle without changing.  This
 * should be used in cases where there is a function that depends on the props and/or state of a
 * component and is also used inside of an effect, but including the function as a dependency to the
 * effect causes unnecessary or infinite rerenders due the functions dependency on state and/or
 * props.
 *
 * @example
 * const MyComponent = ({ initialId }: { initialId: string }) => {
 *   const [stateValue, setStateValue] = useState<number>(0);
 *   const [data, setData] = useState([]);
 *
 *   const fn = useReferentialCallback((data) => {
 *     if (stateValue < 5) {
 *       setData([...])
 *     }
 *   })
 *
 *   useEffect(() => {
 *     fn([{ id: initialId }])
 *   }, [initialId, fn])
 * }
 *
 * When the function is stored as a reference, it does not trigger rerenders or dependency changes
 * to the effect - and instead of re-creating the function when its dependencies on state and/or
 * props change, the same function reference is used.
 *
 * @deprecated
 * This hook is made obsolete with React 19's {@link useEffectEvent}.
 */
export const useReferentialCallback = <P extends unknown[], R>(fn: Callback<P, R>) => {
  const ref = useRef<Callback<P, R>>(fn);
  ref.current = fn;
  const func: Callback<P, R> = (...args: P) => ref.current.apply(this, args);
  return useCallback(func, []);
};
