import { useEffect, useMemo, useRef } from "react";

import { debounce } from "lodash-es";

import { useUnmount } from "./use-unmount";

export type DebouncedCallbackOptions = {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
};

type ControlFunctions = {
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type DebouncedState<T extends (...args: any) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function useDebounceCallback<T extends (...args: any) => ReturnType<T>>(
  func: T,
  delay = 500,
  options?: DebouncedCallbackOptions,
): DebouncedState<T> {
  const debouncedFunc = useRef<ReturnType<typeof debounce>>();

  useUnmount(() => {
    if (debouncedFunc.current) {
      debouncedFunc.current.cancel();
    }
  });

  const debounced = useMemo(() => {
    const debouncedFuncInstance = debounce(func, delay, options);

    const wrappedFunc: DebouncedState<T> = (...args: Parameters<T>) =>
      debouncedFuncInstance(...args);

    wrappedFunc.cancel = () => {
      debouncedFuncInstance.cancel();
    };

    wrappedFunc.isPending = () => !!debouncedFunc.current;

    wrappedFunc.flush = () => debouncedFuncInstance.flush();

    return wrappedFunc;
  }, [func, delay, options]);

  // Update the debounced function ref whenever func, wait, or options change
  useEffect(() => {
    debouncedFunc.current = debounce(func, delay, options);
  }, [func, delay, options]);

  return debounced;
}
