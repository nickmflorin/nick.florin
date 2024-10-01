import { useRef, useMemo } from "react";

import {
  arrow,
  size,
  offset as offsetMiddleware,
  type OffsetOptions,
  type Placement,
  autoPlacement,
} from "@floating-ui/react";

import type * as types from "~/components/floating/types";
import {
  type QuantitativeSize,
  inferQuantitativeSizeValue,
  sizeToString,
} from "~/components/types";

import { useFloating, type UseFloatingConfig } from "./use-floating";

export interface UsePopoverConfig extends Omit<UseFloatingConfig, "triggers" | "placement"> {
  readonly offset?: OffsetOptions;
  readonly width?: QuantitativeSize<"px"> | "target" | "available" | "fit-content";
  readonly maxHeight?: QuantitativeSize<"px"> | "fit-content";
  readonly triggers?: ["click", "hover"] | ["click"] | ["hover"] | ["hover", "click"];
  readonly placement?: Placement | "auto";
  readonly allowedPlacements?: Placement[];
}

export const usePopover = ({
  maxHeight,
  offset,
  width,
  placement,
  allowedPlacements,
  ...config
}: UsePopoverConfig): types.PopoverContext => {
  const arrowRef = useRef<SVGSVGElement>(null);

  const floating = useFloating({
    ...config,
    placement: placement === "auto" ? undefined : placement,
    middleware: [
      arrow({
        element: arrowRef,
      }),
      placement === "auto" ? autoPlacement({ allowedPlacements: allowedPlacements }) : undefined,
      offset ? offsetMiddleware(offset) : undefined,
      size({
        apply({ availableHeight, availableWidth, rects, elements }) {
          if (width !== undefined) {
            /* eslint-disable prettier/prettier */
            // prettier-ignore
            Object.assign(elements.floating.style, {
              width:
                width === "target"
                  ? `${rects.reference.width}px`
                  : width === "available"
                  ? sizeToString(availableWidth, "px")
                  : width === "fit-content"
                  ? "fit-content"
                  : sizeToString(Math.min(inferQuantitativeSizeValue(width), availableWidth), "px"),
            /* eslint-enable prettier/prettier */
            });
          }
          if (maxHeight === undefined) {
            Object.assign(elements.floating.style, {
              maxHeight: `${availableHeight - 10}px`,
            });
          } else {
            Object.assign(elements.floating.style, {
              maxHeight:
                maxHeight !== "fit-content"
                  ? `${inferQuantitativeSizeValue(maxHeight)}px`
                  : "fit-content",
            });
          }
        },
      }),
      ...(config.middleware ?? []),
    ],
  });

  return useMemo(
    () => ({
      arrowRef,
      ...floating,
    }),
    [floating, arrowRef],
  );
};
