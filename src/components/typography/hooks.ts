import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";

import type * as types from "~/components/types/typography";

export interface ControlledTypographyVisibilityConfig {
  readonly initialState?: types.TypographyVisibilityState;
}

export const useControlledTypographyVisibility = ({
  initialState = "collapsed",
}: ControlledTypographyVisibilityConfig) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isTruncated, setIsTruncated] = useState(true);
  const [state, setState] = useState<types.TypographyVisibilityState>(initialState);

  const updateTruncation = useCallback(() => {
    const { offsetHeight, scrollHeight } = ref.current || {};
    if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, []);

  useLayoutEffect(() => {
    updateTruncation();
  }, [updateTruncation]);

  useEffect(() => {
    const listener = () => {
      updateTruncation();
    };
    window.addEventListener("resize", listener, false);
    return () => {
      window.removeEventListener("resize", listener);
    };
  });

  return {
    ref,
    isTruncated,
    state,
    toggle: () => setState(curr => (curr === "collapsed" ? "expanded" : "collapsed")),
  };
};
