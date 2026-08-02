import { useEffect, useRef } from 'react';

export function useUnmount(func: () => void) {
  const funcRef = useRef(func);

  /* The stored function is refreshed after every commit rather than during render, so that the
     cleanup below always invokes the function from the last render that was actually committed. */
  useEffect(() => {
    funcRef.current = func;
  });

  useEffect(
    () => () => {
      funcRef.current();
    },
    [],
  );
}
