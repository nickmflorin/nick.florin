import { useRef, useState } from "react";

import type { DebouncedState, DebouncedCallbackOptions } from "./use-debounced-callback";

import { useDebounceCallback } from "./use-debounced-callback";

type UseDebouncedValueOptions<T> = DebouncedCallbackOptions & {
  equalityFn?: (left: T, right: T) => boolean;
};

export function useDebouncedValue<T>(
  initialValue: T | (() => T),
  delay: number,
  options?: UseDebouncedValueOptions<T>,
): [T, DebouncedState<(value: T) => void>] {
  const eq = options?.equalityFn ?? ((left: T, right: T) => left === right);
  const unwrappedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;

  const [debouncedValue, setDebouncedValue] = useState<T>(unwrappedInitialValue);
  const previousValueRef = useRef<T | undefined>(unwrappedInitialValue);

  const updateDebouncedValue = useDebounceCallback(setDebouncedValue, delay, options);

  // Update the debounced value if the initial value changes
  if (!eq(previousValueRef.current as T, unwrappedInitialValue)) {
    updateDebouncedValue(unwrappedInitialValue);
    previousValueRef.current = unwrappedInitialValue;
  }

  return [debouncedValue, updateDebouncedValue];
}
