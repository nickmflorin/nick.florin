import { useState, useCallback } from "react";

import { MobileNavigationCutoff } from "~/components/constants";
import {
  type Breakpoint,
  Breakpoints,
  getMediaQuery,
  type ScreenSize,
  sizeToNumber,
} from "~/components/types";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";
import { useNavMenu } from "./use-nav-menu";

const getBreakpoint = (w: Window): Breakpoint | "smallest" => {
  let breakpoint: Breakpoint | null = null;
  for (let i = 0; i < Breakpoints.members.length; i++) {
    let mediaQuery: string;
    if (i === Breakpoints.members.length - 1) {
      mediaQuery = getMediaQuery({
        min: Breakpoints.members[i],
      });
    } else {
      mediaQuery = getMediaQuery({
        min: Breakpoints.members[i],
        max: Breakpoints.members[i + 1] as Exclude<Breakpoint, "xxs">,
      });
    }

    if (w.matchMedia(mediaQuery).matches) {
      breakpoint = Breakpoints.members[i];
    }
  }
  if (!breakpoint) {
    return "smallest";
  }
  return breakpoint;
};

type Comparison = "lessThan" | "lessThanOrEqualTo" | "greaterThanOrEqualTo" | "greaterThan";

const Comparators: { [key in Comparison]: (actual: number, compare: number) => boolean } = {
  lessThan: (actual, compare) => actual < compare,
  lessThanOrEqualTo: (actual, compare) => actual <= compare,
  greaterThanOrEqualTo: (actual, compare) => actual >= compare,
  greaterThan: (actual, compare) => actual > compare,
};

export const useScreenSizes = () => {
  const [size, setSize] = useState<number>(window.innerWidth);
  const { close } = useNavMenu();

  const [breakpoint, setBreakpoint] = useState<Breakpoint | "smallest">(() =>
    getBreakpoint(window),
  );

  const handleResize = useCallback(() => {
    const bk = getBreakpoint(window);
    setBreakpoint(bk);
    setSize(window.innerWidth);

    if (window.innerWidth > MobileNavigationCutoff) {
      close();
    }
  }, [close]);

  useIsomorphicLayoutEffect(() => {
    handleResize();

    const listener = () => {
      handleResize();
    };

    window.addEventListener("resize", listener, false);
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, []);

  const compare = useCallback(
    (sz: ScreenSize, comparison: Comparison) => {
      if (breakpoint !== null) {
        if (Breakpoints.contains(sz)) {
          if (Breakpoints.contains(breakpoint)) {
            return Comparators[comparison](
              Breakpoints.members.indexOf(breakpoint),
              Breakpoints.members.indexOf(sz),
            );
          }
          /* Here, the breakpoint is "smallest" - and the screen size is smaller than the smallest
             breakpoint. */
          return true;
        }
        return Comparators[comparison](size, sizeToNumber(sz));
      }
      return false;
    },
    [breakpoint, size],
  );

  const isLessThanOrEqualTo = useCallback(
    (sz: ScreenSize) => compare(sz, "lessThanOrEqualTo"),
    [compare],
  );

  const isGreaterThanOrEqualTo = useCallback(
    (sz: ScreenSize) => compare(sz, "greaterThanOrEqualTo"),
    [compare],
  );

  const isLessThan = useCallback((sz: ScreenSize) => compare(sz, "lessThan"), [compare]);

  const isGreaterThan = useCallback((sz: ScreenSize) => compare(sz, "greaterThan"), [compare]);

  return {
    breakpoint,
    size,
    isLessThanOrEqualTo,
    isLessThan,
    isGreaterThan,
    isGreaterThanOrEqualTo,
  };
};
