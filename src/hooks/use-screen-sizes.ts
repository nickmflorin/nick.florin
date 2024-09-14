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

  const isLessThanOrEqualTo = useCallback(
    (sz: ScreenSize) => {
      if (breakpoint !== null) {
        if (Breakpoints.contains(sz)) {
          if (Breakpoints.contains(breakpoint)) {
            return Breakpoints.members.indexOf(sz) >= Breakpoints.members.indexOf(breakpoint);
          }
          /* Here, the breakpoint is "smallest" - and the screen size is smaller than the smallest
             breakpoint. */
          return true;
        }
        return sizeToNumber(sz) >= size;
      }
      return false;
    },
    [breakpoint, size],
  );

  const isLessThan = useCallback(
    (sz: ScreenSize) => {
      if (breakpoint !== null) {
        if (Breakpoints.contains(sz)) {
          if (Breakpoints.contains(breakpoint)) {
            return Breakpoints.members.indexOf(sz) > Breakpoints.members.indexOf(breakpoint);
          }
          /* Here, the breakpoint is "smallest" - and the screen size is smaller than the smallest
             breakpoint. */
          return true;
        }
        return sizeToNumber(sz) > size;
      }
      return false;
    },
    [breakpoint, size],
  );

  return { breakpoint, size, isLessThanOrEqualTo, isLessThan };
};
