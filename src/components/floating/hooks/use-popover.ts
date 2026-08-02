import { useMemo, useRef } from 'react';

import {
  arrow,
  autoPlacement,
  offset as offsetMiddleware,
  type OffsetOptions,
  type Placement,
  size,
} from '@floating-ui/react';

import type * as types from '~/components/floating/types';
import {
  inferQuantitativeSizeValue,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

import { useFloating, type UseFloatingConfig } from './use-floating';

export interface UsePopoverConfig extends Omit<UseFloatingConfig, 'placement' | 'triggers'> {
  readonly allowedPlacements?: Placement[];
  readonly maxHeight?: 'fit-content' | QuantitativeSize<'px'>;
  readonly offset?: OffsetOptions;
  readonly placement?: 'auto' | Placement;
  readonly triggers?: ['click', 'hover'] | ['click'] | ['hover', 'click'] | ['hover'];
  readonly width?: 'available' | 'fit-content' | 'target' | QuantitativeSize<'px'>;
}

export const usePopover = ({
  allowedPlacements,
  maxHeight,
  offset,
  placement,
  width,
  ...config
}: UsePopoverConfig): types.PopoverContext => {
  const arrowRef = useRef<SVGSVGElement>(null);

  const floating = useFloating({
    ...config,
    middleware: [
      /* eslint-disable-next-line react-hooks/refs -- The 'arrow' middleware stores the ref and
         reads the element from it while positioning the floating element, which happens in a
         layout effect rather than during render. */
      arrow({
        element: arrowRef,
      }),
      placement === 'auto' ? autoPlacement({ allowedPlacements }) : undefined,
      offset ? offsetMiddleware(offset) : undefined,
      size({
        apply({ availableHeight, availableWidth, elements, rects }) {
          if (width !== undefined) {
            // prettier-ignore
            Object.assign(elements.floating.style, {
              width:
                width === 'target'
                  ? `${rects.reference.width}px`
                  : width === 'available'
                  ? sizeToString(availableWidth, 'px')
                  : width === 'fit-content'
                  ? 'fit-content'
                  : sizeToString(Math.min(inferQuantitativeSizeValue(width), availableWidth), 'px'),
             
            });
          }
          if (maxHeight === undefined) {
            Object.assign(elements.floating.style, {
              maxHeight: `${availableHeight - 10}px`,
            });
          } else {
            Object.assign(elements.floating.style, {
              maxHeight:
                maxHeight === 'fit-content'
                  ? 'fit-content'
                  : `${inferQuantitativeSizeValue(maxHeight)}px`,
            });
          }
        },
      }),
      ...(config.middleware ?? []),
    ],
    placement: placement === 'auto' ? undefined : placement,
  });

  return useMemo(
    () => ({
      arrowRef,
      ...floating,
    }),
    [floating, arrowRef],
  );
};
