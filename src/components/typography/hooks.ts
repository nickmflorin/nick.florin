import { useRef, useState, useLayoutEffect } from "react";

import type * as types from "./types";

export interface ControlledTypographyVisibilityConfig {
  readonly initialState?: types.TypographyVisibilityState;
}

export const useControlledTypographyVisibility = ({
  initialState = "collapsed",
}: ControlledTypographyVisibilityConfig) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // TODO: Make initial state depend on the present of the lineclamp prop
  const [isTruncated, setIsTruncated] = useState(true);
  const [state, setState] = useState<types.TypographyVisibilityState>(initialState);

  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = ref.current || {};
    if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, [ref]);

  return {
    ref,
    isTruncated,
    state,
    toggle: () => setState(curr => (curr === "collapsed" ? "expanded" : "collapsed")),
  };
};
