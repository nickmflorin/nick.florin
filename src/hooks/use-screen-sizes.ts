import { useState, useCallback } from "react";

import { type ScreenSize, ScreenSizes, getMediaQuery } from "~/components/types";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

type UseScreenSizeConfig = {
  readonly defaultSize?: ScreenSize;
};

type UseScreenSizeReturn<C extends UseScreenSizeConfig> = C extends { defaultSize: ScreenSize }
  ? {
      size: ScreenSize;
      isLessThan: (size: Exclude<ScreenSize, "xs">) => boolean;
      isLessThanOrEqualTo: (size: ScreenSize) => boolean;
    }
  : {
      size: ScreenSize | null;
      isLessThan: (size: Exclude<ScreenSize, "xs">) => boolean;
      isLessThanOrEqualTo: (size: ScreenSize) => boolean;
    };

const getScreenSize = (w: Window): ScreenSize => {
  let size: ScreenSize | null = null;
  for (let i = 0; i < ScreenSizes.values.length; i++) {
    let mediaQuery: string;
    if (i === ScreenSizes.values.length - 1) {
      mediaQuery = getMediaQuery({
        min: ScreenSizes.values[i],
      });
    } else {
      mediaQuery = getMediaQuery({
        min: ScreenSizes.values[i],
        max: ScreenSizes.values[i + 1] as Exclude<ScreenSize, "xs">,
      });
    }
    if (w.matchMedia(mediaQuery).matches) {
      size = ScreenSizes.values[i];
    }
  }
  if (!size) {
    throw new Error(
      "No screen size corresponds to the current window width. " +
        "This indicates there is something wrong with the logic that determines the screen size.",
    );
  }
  return size;
};

export const useScreenSizes = <C extends UseScreenSizeConfig>({
  defaultSize,
}: C): UseScreenSizeReturn<C> => {
  const [size, setSize] = useState<ScreenSize | null>(() => {
    if (defaultSize) {
      return defaultSize;
    } else if (typeof window !== undefined) {
      return getScreenSize(window);
    }
    return null;
  });

  const handleResize = useCallback(() => {
    let size: ScreenSize | null = null;
    for (let i = 0; i < ScreenSizes.values.length; i++) {
      let mediaQuery: string;
      if (i === ScreenSizes.values.length - 1) {
        mediaQuery = getMediaQuery({
          min: ScreenSizes.values[i],
        });
      } else {
        mediaQuery = getMediaQuery({
          min: ScreenSizes.values[i],
          max: ScreenSizes.values[i + 1] as Exclude<ScreenSize, "xs">,
        });
      }
      if (window.matchMedia(mediaQuery).matches) {
        size = ScreenSizes.values[i];
      }
    }
    if (!size) {
      throw new Error("");
    }
    setSize(size);
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
      if (size !== null) {
        return ScreenSizes.values.indexOf(size) <= ScreenSizes.values.indexOf(sz);
      }
      return false;
    },
    [size],
  );

  const isLessThan = useCallback(
    (sz: Exclude<ScreenSize, "xs">) => {
      if (size !== null) {
        return ScreenSizes.values.indexOf(size) < ScreenSizes.values.indexOf(sz);
      }
      return false;
    },
    [size],
  );

  return { size, isLessThanOrEqualTo, isLessThan } as UseScreenSizeReturn<C>;
};
