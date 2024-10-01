import { useState, useCallback, useRef } from "react";

import {
  type Breakpoint,
  Breakpoints,
  getMediaQuery,
  type ScreenSize,
  inferQuantitativeSizeValue,
  type ContainerBreakpoint,
  ContainerBreakpoints,
  type ContainerSize,
} from "~/components/types";

import { useWindowResize } from "./use-window-resize";

const getContainerBreakpoint = <T extends HTMLElement>(
  container: T | null,
): ContainerBreakpoint | "smallest" | null => {
  let breakpoint: ContainerBreakpoint | null = null;
  if (container) {
    for (let i = 0; i < ContainerBreakpoints.models.length; i++) {
      if (i === ContainerBreakpoints.members.length - 1) {
        if (container.clientWidth < ContainerBreakpoints.models[i].size + 1) {
          breakpoint = ContainerBreakpoints.members[i];
        }
      } else {
        if (
          container.clientWidth < ContainerBreakpoints.models[i + 1].size + 1 &&
          container.clientWidth > ContainerBreakpoints.models[i].size
        ) {
          breakpoint = ContainerBreakpoints.members[i];
        }
      }
    }
    if (!breakpoint) {
      return "smallest";
    }
  }
  return breakpoint;
};

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

  const [breakpoint, setBreakpoint] = useState<Breakpoint | "smallest">(() =>
    getBreakpoint(window),
  );

  useWindowResize(w => {
    const bk = getBreakpoint(window);
    setBreakpoint(bk);
    setSize(w.innerWidth);
  });

  const compare = useCallback(
    (sz: ScreenSize, comparison: Comparison) => {
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
      return Comparators[comparison](size, inferQuantitativeSizeValue(sz));
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

export const useContainerSizes = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);

  const [size, setSize] = useState<number | null>(null);
  const [breakpoint, setBreakpoint] = useState<ContainerBreakpoint | "smallest" | null>(() =>
    getContainerBreakpoint(ref.current),
  );

  useWindowResize(() => {
    if (ref.current) {
      const bk = getContainerBreakpoint(ref.current);
      setBreakpoint(bk);
      setSize(ref.current.clientWidth);
    }
  });

  const compare = useCallback(
    (sz: ContainerSize, comparison: Comparison) => {
      if (breakpoint !== null && size !== null) {
        if (ContainerBreakpoints.contains(sz)) {
          if (ContainerBreakpoints.contains(breakpoint)) {
            return Comparators[comparison](
              ContainerBreakpoints.members.indexOf(breakpoint),
              ContainerBreakpoints.members.indexOf(sz),
            );
          }
          /* Here, the breakpoint is "smallest" - and the container size is smaller than the
             smallest breakpoint. */
          return true;
        }
        return Comparators[comparison](size, inferQuantitativeSizeValue(sz));
      }
      return false;
    },
    [breakpoint, size],
  );

  const isLessThanOrEqualTo = useCallback(
    (sz: ContainerSize) => compare(sz, "lessThanOrEqualTo"),
    [compare],
  );

  const isGreaterThanOrEqualTo = useCallback(
    (sz: ContainerSize) => compare(sz, "greaterThanOrEqualTo"),
    [compare],
  );

  const isLessThan = useCallback((sz: ContainerSize) => compare(sz, "lessThan"), [compare]);

  const isGreaterThan = useCallback((sz: ContainerSize) => compare(sz, "greaterThan"), [compare]);

  return {
    ref,
    breakpoint,
    size,
    isLessThanOrEqualTo,
    isLessThan,
    isGreaterThan,
    isGreaterThanOrEqualTo,
  };
};
