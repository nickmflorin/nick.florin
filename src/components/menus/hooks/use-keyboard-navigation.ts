import { type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { clamp } from 'lodash-es';

import { logger } from '~/internal/logger';

export type NavigationDirection = 'down' | 'up';

export interface UseKeyboardNavigationOptions<T> {
  readonly containerRef?: MutableRefObject<HTMLDivElement | null>;
  readonly data: T[];
  readonly enabled?: boolean;
  readonly excludeItemFromNavigation?: (datum: T) => boolean;
  readonly getItemAtNavigatedIndex?: (data: T[], index: number) => T | undefined;
  readonly navigatedSelector?: string;
  readonly onEnter?: (e: KeyboardEvent, index: number, datum: T) => void;
  readonly onExit?: () => void;
  readonly scrollOptions?: ScrollIntoViewOptions;
}

export const useKeyboardNavigation = <T>({
  containerRef: propContainerRef,
  data,
  enabled = true,
  excludeItemFromNavigation,
  getItemAtNavigatedIndex: _getItemAtNavigatedIndex,
  navigatedSelector = '[data-attr-navigated="true"]',
  onEnter,
  onExit,
  scrollOptions,
}: UseKeyboardNavigationOptions<T>) => {
  const _containerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = propContainerRef ?? _containerRef;

  const navigatableData = useMemo(
    () =>
      excludeItemFromNavigation === undefined
        ? data
        : data.filter(datum => !excludeItemFromNavigation(datum)),
    [data, excludeItemFromNavigation],
  );

  const [rawNavigatedIndex, setRawNavigatedIndex] = useState<null | number>(null);

  const scrollIntoView = useCallback(
    (direction: NavigationDirection) => {
      if (containerRef.current) {
        const navigatedElement = containerRef.current.querySelector<HTMLElement>(navigatedSelector);
        if (navigatedElement) {
          switch (direction) {
            case 'down': {
              if (
                navigatedElement.offsetTop + navigatedElement.offsetHeight >=
                containerRef.current.clientHeight
              ) {
                return navigatedElement.scrollIntoView({
                  ...scrollOptions,
                  behavior: scrollOptions?.behavior ?? 'smooth',
                  block: scrollOptions?.block ?? 'start',
                });
              }
              return;
            }
            case 'up': {
              if (navigatedElement.offsetTop - navigatedElement.offsetHeight <= 0) {
                return navigatedElement.scrollIntoView({
                  ...scrollOptions,
                  behavior: scrollOptions?.behavior ?? 'smooth',
                  block: scrollOptions?.block ?? 'start',
                });
              }
            }
          }
        }
      } else {
        logger.warn(
          'Could not scroll the navigated element into view because the container ref is null.',
        );
      }
    },
    [scrollOptions, containerRef, navigatedSelector],
  );

  const numItems = navigatableData.length;

  /* The navigated index is clamped as it is read rather than corrected from an effect, so that it
     can never point past the end of the data - not even on the render in which the data shrinks. */
  const navigatedIndex =
    rawNavigatedIndex === null || numItems === 0 ? null : clamp(rawNavigatedIndex, 0, numItems - 1);

  const incrementNavigatedIndex = useCallback(() => {
    setRawNavigatedIndex(Math.min(navigatedIndex === null ? 0 : navigatedIndex + 1, numItems - 1));
    setTimeout(() => scrollIntoView('down'));
  }, [numItems, navigatedIndex, scrollIntoView]);

  const decrementNavigatedIndex = useCallback(() => {
    setRawNavigatedIndex(Math.max(navigatedIndex === null ? 0 : navigatedIndex - 1, 0));
    setTimeout(() => scrollIntoView('up'));
  }, [navigatedIndex, scrollIntoView]);

  useEffect(() => {
    const getItemAtNavigatedIndex = _getItemAtNavigatedIndex ?? ((d, index) => d[index]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        decrementNavigatedIndex();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        incrementNavigatedIndex();
      } else if (e.key === 'Enter') {
        if (navigatedIndex !== null && onEnter !== undefined) {
          const datum = getItemAtNavigatedIndex(navigatableData, navigatedIndex);
          if (datum !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            onEnter(e, navigatedIndex, datum);
          }
        }
      } else {
        onExit?.();
      }
    };
    if (enabled) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
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

  return { containerRef, decrementNavigatedIndex, incrementNavigatedIndex, navigatedIndex };
};
