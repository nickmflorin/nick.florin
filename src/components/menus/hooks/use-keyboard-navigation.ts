import { useRef, useState, useEffect, useCallback, type MutableRefObject, useMemo } from "react";

import { clamp } from "lodash-es";

import { logger } from "~/internal/logger";

export type NavigationDirection = "up" | "down";

export interface UseKeyboardNavigationOptions<T> {
  readonly enabled?: boolean;
  readonly data: T[];
  readonly containerRef?: MutableRefObject<HTMLDivElement | null>;
  readonly navigatedClassName?: string;
  readonly scrollOptions?: ScrollIntoViewOptions;
  readonly excludeItemFromNavigation?: (datum: T) => boolean;
  readonly getItemAtNavigatedIndex?: (data: T[], index: number) => T | undefined;
  readonly onExit?: () => void;
  readonly onEnter?: (e: KeyboardEvent, index: number, datum: T) => void;
}

export const useKeyboardNavigation = <T>({
  enabled = true,
  data,
  containerRef: propContainerRef,
  scrollOptions,
  navigatedClassName = ".menu__item--navigated",
  excludeItemFromNavigation,
  getItemAtNavigatedIndex: _getItemAtNavigatedIndex,
  onExit,
  onEnter,
}: UseKeyboardNavigationOptions<T>) => {
  const _containerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = propContainerRef ?? _containerRef;

  const navigatableData = useMemo(
    () =>
      excludeItemFromNavigation !== undefined
        ? data.filter(datum => !excludeItemFromNavigation(datum))
        : data,
    [data, excludeItemFromNavigation],
  );

  const [navigatedIndex, setNavigatedIndex] = useState<number | null>(null);

  const scrollIntoView = useCallback(
    (direction: NavigationDirection) => {
      if (containerRef.current) {
        const navigatedElement = containerRef.current.querySelector(
          navigatedClassName.startsWith(".") ? navigatedClassName : `.${navigatedClassName}`,
        ) as HTMLElement | null;
        if (navigatedElement) {
          switch (direction) {
            case "down": {
              if (
                navigatedElement.offsetTop + navigatedElement.offsetHeight >=
                containerRef.current.clientHeight
              ) {
                return navigatedElement.scrollIntoView({
                  ...scrollOptions,
                  behavior: scrollOptions?.behavior ?? "smooth",
                  block: scrollOptions?.block ?? "start",
                });
              }
              return;
            }
            case "up": {
              if (navigatedElement.offsetTop - navigatedElement.offsetHeight <= 0) {
                return navigatedElement.scrollIntoView({
                  ...scrollOptions,
                  behavior: scrollOptions?.behavior ?? "smooth",
                  block: scrollOptions?.block ?? "start",
                });
              }
              return;
            }
          }
        }
      } else {
        logger.warn(
          "Could not scroll the navigated element into view because the container ref is null.",
        );
      }
    },
    [scrollOptions, containerRef, navigatedClassName],
  );

  const numItems = navigatableData.length;

  useEffect(() => {
    setNavigatedIndex(curr => (curr ? clamp(curr, 0, numItems - 1) : null));
  }, [numItems]);

  const incrementNavigatedIndex = useCallback(() => {
    setNavigatedIndex(curr => Math.min(curr !== null ? curr + 1 : 0, numItems - 1));
    setTimeout(() => scrollIntoView("down"));
  }, [numItems, scrollIntoView]);

  const decrementNavigatedIndex = useCallback(() => {
    setNavigatedIndex(curr => Math.max(curr !== null ? curr - 1 : 0, 0));
    setTimeout(() => scrollIntoView("up"));
  }, [scrollIntoView]);

  useEffect(() => {
    const getItemAtNavigatedIndex = _getItemAtNavigatedIndex ?? ((d, index) => d[index]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        decrementNavigatedIndex();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        incrementNavigatedIndex();
      } else if (e.key === "Enter") {
        if (navigatedIndex && onEnter !== undefined) {
          const datum = getItemAtNavigatedIndex(navigatableData, navigatedIndex);
          if (datum !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            onEnter?.(e, navigatedIndex as number, datum);
          }
        }
      } else {
        onExit?.();
      }
    };
    if (enabled) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    enabled,
    navigatedIndex,
    navigatableData,
    onEnter,
    _getItemAtNavigatedIndex,
    incrementNavigatedIndex,
    decrementNavigatedIndex,
    onExit,
  ]);

  return { containerRef, navigatedIndex, incrementNavigatedIndex, decrementNavigatedIndex };
};
