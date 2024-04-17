import { useRef, useState, useMemo } from "react";

import {
  type Placement,
  arrow,
  useFloating as rootUseFloating,
  useInteractions,
  useHover,
  useClick,
  useDismiss,
  size,
  offset as offsetMiddleware,
  type OffsetOptions,
  autoUpdate as autoUpdater,
  type Middleware,
} from "@floating-ui/react";

import type * as types from "./types";

import { type QuantitativeSize, type Size, sizeToNumber, sizeToString } from "~/components/types";

export interface UseFloatingConfig {
  readonly isOpen?: boolean;
  readonly autoUpdate?: boolean;
  readonly triggers?: types.FloatingTrigger[];
  readonly offset?: OffsetOptions;
  readonly placement?: Placement;
  readonly width?: QuantitativeSize<"px"> | "target" | "available";
  readonly maxHeight?: Size<"px">;
  readonly middleware?: Array<Middleware | null | undefined | false>;
  readonly onOpen?: (e: Event) => void;
  readonly onClose?: (e: Event) => void;
  readonly onOpenChange?: (value: boolean, evt: Event) => void;
}

export const useFloating = ({
  // Note: This should not be blindly turned on because it can cause performance degradation.
  autoUpdate = false,
  triggers = ["hover"],
  isOpen: propIsOpen,
  maxHeight: _propMaxHeight,
  placement,
  offset,
  width,
  middleware,
  onOpen,
  onClose,
  onOpenChange,
}: UseFloatingConfig) => {
  const [_isOpen, setIsOpen] = useState(false);

  /* Allow the open state of the floating element to be controlled externally to the component if
     desired. */
  const isOpen = propIsOpen === undefined ? _isOpen : propIsOpen;

  const arrowRef = useRef<SVGSVGElement>(null);

  const { refs, floatingStyles, context } = rootUseFloating({
    open: isOpen,
    whileElementsMounted: autoUpdate ? autoUpdater : undefined,
    onOpenChange: (value: boolean, evt: Event) => {
      setIsOpen(value);
      onOpenChange?.(value, evt);
      if (value === true) {
        onOpen?.(evt);
      } else {
        onClose?.(evt);
      }
    },
    placement,
    middleware: [
      arrow({
        element: arrowRef,
      }),
      offset ? offsetMiddleware(offset) : undefined,
      size({
        // padding: 10,
        apply({ availableHeight, availableWidth, rects, elements }) {
          if (width !== undefined) {
            Object.assign(elements.floating.style, {
              width:
                width === "target"
                  ? `${rects.reference.width}px`
                  : width === "available"
                    ? sizeToString(availableWidth, "px")
                    : sizeToString(Math.min(sizeToNumber(width), availableWidth), "px"),
            });
          }
          if (_propMaxHeight === undefined) {
            Object.assign(elements.floating.style, {
              maxHeight: `${availableHeight - 10}px`,
            });
            // flushSync(() => setMaxHeight(`${availableHeight - 10}px`));
          } else {
            Object.assign(elements.floating.style, {
              maxHeight:
                _propMaxHeight !== "fit-content"
                  ? `${sizeToNumber(_propMaxHeight)}px`
                  : _propMaxHeight,
            });
          }
        },
      }),
      ...(middleware ?? []),
    ],
  });

  const dismiss = useDismiss(context, { enabled: triggers.includes("click") });
  const hover = useHover(context, { enabled: triggers.includes("hover") });
  const click = useClick(context, { enabled: triggers.includes("click") });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  const referenceProps = useMemo(() => getReferenceProps(), [getReferenceProps]);
  const floatingProps = useMemo(() => getFloatingProps(), [getFloatingProps]);

  return {
    referenceProps,
    floatingProps,
    context,
    arrowRef,
    refs,
    floatingStyles,
    isOpen,
  };
};
