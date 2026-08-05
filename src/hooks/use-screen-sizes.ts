import { use, useCallback, useRef, useState } from 'react';

import { ScreenSizeSeedContext } from '~/components/config/context';
import {
  type Breakpoint,
  Breakpoints,
  type ContainerBreakpoint,
  ContainerBreakpoints,
  type ContainerSize,
  getBreakpointFromWidth,
  getBreakpointFromWindow,
  getLowerRangeContainerBreakpoint,
  inferQuantitativeSizeValue,
  type ScreenSize,
} from '~/components/types';

import { useWindowResize } from './use-window-resize';

type Comparison = 'greaterThan' | 'greaterThanOrEqualTo' | 'lessThan' | 'lessThanOrEqualTo';

const Comparators: Record<Comparison, (actual: number, compare: number) => boolean> = {
  greaterThan: (actual, compare) => actual > compare,
  greaterThanOrEqualTo: (actual, compare) => actual >= compare,
  lessThan: (actual, compare) => actual < compare,
  lessThanOrEqualTo: (actual, compare) => actual <= compare,
};

export const useScreenSizes = () => {
  /* The seed is the viewport width the server assumed for this request (derived from the
     User-Agent's device class by the middleware), so the server render and the client's first,
     hydration render agree on the responsive variant. `useWindowResize` invokes its handler once on
     mount inside a layout effect, replacing the seeded values with the real window measurements
     before the browser paints the hydrated tree. */
  const seedWidth = use(ScreenSizeSeedContext);

  const [size, setSize] = useState<number>(seedWidth);

  const [breakpoint, setBreakpoint] = useState<'0' | Breakpoint>(() =>
    getBreakpointFromWidth(seedWidth),
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
    (sz: ScreenSize) => compare(sz, 'lessThanOrEqualTo'),
    [compare],
  );

  const isGreaterThanOrEqualTo = useCallback(
    (sz: ScreenSize) => compare(sz, 'greaterThanOrEqualTo'),
    [compare],
  );

  const isLessThan = useCallback((sz: ScreenSize) => compare(sz, 'lessThan'), [compare]);

  const isGreaterThan = useCallback((sz: ScreenSize) => compare(sz, 'greaterThan'), [compare]);

  return {
    breakpoint,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    size,
  };
};

export const useContainerSizes = <T extends HTMLElement>() => {
  const ref = useRef<null | T>(null);

  const [size, setSize] = useState<null | number>(null);
  /* The container cannot be measured before the ref is attached to it, which does not happen until
     after the initial render, so the breakpoint starts at the smallest one and is corrected by the
     first resize measurement. */
  const [breakpoint, setBreakpoint] = useState<'0' | ContainerBreakpoint | null>('0');

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
    (sz: ContainerSize) => compare(sz, 'lessThanOrEqualTo'),
    [compare],
  );

  const isGreaterThanOrEqualTo = useCallback(
    (sz: ContainerSize) => compare(sz, 'greaterThanOrEqualTo'),
    [compare],
  );

  const isLessThan = useCallback((sz: ContainerSize) => compare(sz, 'lessThan'), [compare]);

  const isGreaterThan = useCallback((sz: ContainerSize) => compare(sz, 'greaterThan'), [compare]);

  return {
    breakpoint,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    ref,
    size,
  };
};
