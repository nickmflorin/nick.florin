import { useState, useCallback, useRef } from "react";

import {
  type Breakpoint,
  Breakpoints,
  getLowerRangeContainerBreakpoint,
  getBreakpointFromWindow,
  type ScreenSize,
  inferQuantitativeSizeValue,
  type ContainerBreakpoint,
  ContainerBreakpoints,
  type ContainerSize,
} from "~/components/types";

import { useWindowResize } from "./use-window-resize";

type Comparison = "lessThan" | "lessThanOrEqualTo" | "greaterThanOrEqualTo" | "greaterThan";

const Comparators: { [key in Comparison]: (actual: number, compare: number) => boolean } = {
  lessThan: (actual, compare) => actual < compare,
  lessThanOrEqualTo: (actual, compare) => actual <= compare,
  greaterThanOrEqualTo: (actual, compare) => actual >= compare,
  greaterThan: (actual, compare) => actual > compare,
};

export const useScreenSizes = () => {
  const [size, setSize] = useState<number>(window.innerWidth);

  const [breakpoint, setBreakpoint] = useState<Breakpoint | "0">(() =>
    getBreakpointFromWindow(window),
  );

  useWindowResize(w => {
    const bk = getBreakpointFromWindow(window);
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
  const [breakpoint, setBreakpoint] = useState<ContainerBreakpoint | "0" | null>(() =>
    ref.current ? getLowerRangeContainerBreakpoint(ref.current.clientWidth) : "0",
  );

  useWindowResize(() => {
    if (ref.current) {
      const bk = getLowerRangeContainerBreakpoint(ref.current.clientWidth);
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
