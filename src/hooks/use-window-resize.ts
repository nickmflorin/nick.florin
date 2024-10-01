import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export const useWindowResize = (fn: (w: Window) => void) => {
  useIsomorphicLayoutEffect(() => {
    fn(window);

    const listener = () => {
      fn(window);
    };

    window.addEventListener("resize", listener, false);
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [fn]);
};
