import { useState, useCallback } from "react";

import {
  type Breakpoint,
  Breakpoints,
  getMediaQuery,
  type ScreenSize,
  sizeToNumber,
} from "~/components/types";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

type UseScreenSizeConfig = {
  readonly defaultSize?: Breakpoint;
};

type UseScreenSizeReturn<C extends UseScreenSizeConfig> = C extends { defaultSize: Breakpoint }
  ? {
      breakpoint: Breakpoint;
      size: number;
      isLessThan: (size: Exclude<ScreenSize, "xs">) => boolean;
      isLessThanOrEqualTo: (size: ScreenSize) => boolean;
    }
  : {
      breakpoint: Breakpoint | null;
      size: number;
      isLessThan: (size: Exclude<ScreenSize, "xs">) => boolean;
      isLessThanOrEqualTo: (size: ScreenSize) => boolean;
    };

const getBreakpoint = (w: Window): Breakpoint => {
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
    throw new Error(
      "No screen size corresponds to the current window width. " +
        "This indicates there is something wrong with the logic that determines the screen size.",
    );
  }
  return breakpoint;
};

export const useScreenSizes = <C extends UseScreenSizeConfig>({
  defaultSize,
}: C): UseScreenSizeReturn<C> => {
  const [size, setSize] = useState<number>(window.innerWidth);

  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(() => {
    if (defaultSize) {
      return defaultSize;
    }
    return getBreakpoint(window);
  });

  const handleResize = useCallback(() => {
    const bk = getBreakpoint(window);
    setBreakpoint(bk);
    setSize(window.innerWidth);
  }, []);

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
          return Breakpoints.members.indexOf(sz) >= Breakpoints.members.indexOf(breakpoint);
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
          return Breakpoints.members.indexOf(sz) > Breakpoints.members.indexOf(breakpoint);
        }
        return sizeToNumber(sz) > size;
      }
      return false;
    },
    [breakpoint, size],
  );

  return { breakpoint, size, isLessThanOrEqualTo, isLessThan } as UseScreenSizeReturn<C>;
};
