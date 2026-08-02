import { useEffect, useRef, useState } from 'react';

import {
  type DebouncedCallbackOptions,
  type DebouncedState,
  useDebounceCallback,
} from './use-debounced-callback';

type UseDebouncedValueOptions<T> = {
  equalityFn?: (left: T, right: T) => boolean;
} & DebouncedCallbackOptions;

export function useDebouncedValue<T>(
  initialValue: (() => T) | T,
  delay: number,
  options?: UseDebouncedValueOptions<T>,
): [T, DebouncedState<(value: T) => void>] {
  const eq = options?.equalityFn ?? ((left: T, right: T) => left === right);
  const unwrappedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;

  const [debouncedValue, setDebouncedValue] = useState<T>(unwrappedInitialValue);
  const previousValueRef = useRef<T>(unwrappedInitialValue);
  const equalityRef = useRef(eq);

  const updateDebouncedValue = useDebounceCallback(setDebouncedValue, delay, options);

  useEffect(() => {
    equalityRef.current = eq;
  });

  /* The value is compared against the one seen on the previous commit, rather than against a
     dependency array, because the comparison has to be made with the caller's equality function
     instead of by identity.  The comparison runs after every commit for that reason, and the
     previous value is only ever touched from inside an effect so that no bookkeeping happens
     while rendering. */
  useEffect(() => {
    if (!equalityRef.current(previousValueRef.current, unwrappedInitialValue)) {
      previousValueRef.current = unwrappedInitialValue;
      updateDebouncedValue(unwrappedInitialValue);
    }
  });

  return [debouncedValue, updateDebouncedValue];
}
