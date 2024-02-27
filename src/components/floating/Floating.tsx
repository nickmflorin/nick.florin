"use client";
import { type ReactNode, useRef, cloneElement, useState, useMemo, type CSSProperties } from "react";

import {
  FloatingArrow,
  type Placement,
  arrow,
  useFloating,
  type ReferenceType,
  useInteractions,
  useHover,
  useClick,
  useDismiss,
  size,
  offset as offsetMiddleware,
  type OffsetOptions,
  FloatingPortal,
  autoUpdate as autoUpdater,
} from "@floating-ui/react";
import clsx from "clsx";
import { flushSync } from "react-dom";

import { type Size, type ComponentProps } from "~/components/types";

import { FloatingContent } from "./FloatingContent";
import * as types from "./types";

export type FloatingRenderProps = {
  readonly params: ReturnType<ReturnType<typeof useInteractions>["getReferenceProps"]>;
  readonly ref: (node: ReferenceType | null) => void;
};

export type FloatingContentRenderProps = {
  readonly params: Record<string, unknown>;
  readonly styles: CSSProperties;
  readonly ref: (node: HTMLElement | null) => void;
};

type FloatingTrigger = "hover" | "click";

const WrapInPortal = ({
  children,
  inPortal = false,
}: {
  inPortal?: boolean;
  children: JSX.Element;
}) => {
  if (inPortal) {
    return <FloatingPortal>{children}</FloatingPortal>;
  }
  return children;
};

export interface FloatingProps extends ComponentProps {
  /**
   * The content that appears inside of the floating element.
   */
  readonly content: ReactNode | ((props: FloatingContentRenderProps) => ReactNode);
  readonly isOpen?: boolean;
  readonly autoUpdate?: boolean;
  readonly triggers?: FloatingTrigger[];
  readonly variant?: types.FloatingVariant;
  readonly withArrow?: boolean;
  readonly offset?: OffsetOptions;
  readonly arrowClassName?: ComponentProps["className"];
  readonly inPortal?: boolean;
  /**
   * The element that should trigger the floating content to apper and/or disappear, depending on
   * its interactions state - such as hovered, clicked, etc.  Can be provided either as a render
   * prop or a JSX element - in which case the ref will be injected into the element's props
   * dynamically.
   *
   * Note:
   * -----
   * Generally, it is simpler and more explicit to provide the children as a render prop, and
   * manually pass the 'ref' and other reference props to the element that should trigger the
   * floating content to appear.
   *
   * However, this is problematic with NextJS's server components, because you cannot pass a
   * function from a server component to a child component.  In those cases, the server component
   * can simply provide the children as a JSX element, and allow the ref and other reference props
   * to be injected into the element in this component dynamically, on the client.
   *
   * Note that in both cases, the target element must expose the reference props and 'ref', but in
   * the case that they are automatically injected, TS will not let us know whether or not that
   * component does not accept those props - which can lead to bugs with the floating element's
   * usage.
   */
  readonly children: JSX.Element | ((params: FloatingRenderProps) => JSX.Element);
  readonly placement?: Placement;
  readonly width?: number | "target";
  readonly isDisabled?: boolean;
  readonly onOpen?: (e: Event) => void;
  readonly onClose?: (e: Event) => void;
  readonly onOpenChange?: (value: boolean, evt: Event) => void;
}

export const Floating = ({
  className,
  style,
  children: _children,
  // Note: This should not be blindly turned on because it can cause performance degradation.
  autoUpdate = false,
  triggers = ["hover"],
  isOpen: propIsOpen,
  inPortal = false,
  content,
  placement,
  offset,
  isDisabled = false,
  withArrow = true,
  arrowClassName,
  width,
  variant = types.FloatingVariants.PRIMARY,
  onOpen,
  onClose,
  onOpenChange,
}: FloatingProps) => {
  const [_isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<Size | null>(null);

  /* Allow the open state of the floating element to be controlled externally to the component if
     desired. */
  const isOpen = propIsOpen === undefined ? _isOpen : propIsOpen;

  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
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
        padding: 10,
        apply({ availableHeight, rects, elements }) {
          if (width !== undefined) {
            Object.assign(elements.floating.style, {
              width: typeof width === "number" ? `${width}px` : `${rects.reference.width}px`,
            });
          }
          flushSync(() => setMaxHeight(`${availableHeight}px`));
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, { enabled: triggers.includes("click") });
  const hover = useHover(context, { enabled: triggers.includes("hover") });
  const click = useClick(context, { enabled: triggers.includes("click") });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  const referenceProps = getReferenceProps();

  const children = useMemo(() => {
    if (typeof _children === "function") {
      return _children({ ref: refs.setReference, params: referenceProps });
    }
    return cloneElement(_children, {
      ref: refs.setReference,
      ...referenceProps,
    });
  }, [_children, refs, referenceProps]);

  const floatingProps = getFloatingProps();

  return (
    <>
      {children}
      {isOpen && !isDisabled && (
        <WrapInPortal inPortal={inPortal}>
          <>
            {typeof content === "function" ? (
              content({
                ref: refs.setFloating,
                params: floatingProps,
                styles: maxHeight ? { ...floatingStyles, maxHeight } : floatingStyles,
              })
            ) : (
              <FloatingContent
                ref={refs.setFloating}
                variant={variant}
                {...floatingProps}
                style={
                  maxHeight
                    ? { ...style, ...floatingStyles, maxHeight }
                    : { ...style, ...floatingStyles }
                }
                className={clsx(
                  /* Typically, the floating props do not include a class name - but just in case,
                     we want to merge it with the content class name, if it exists. */
                  typeof floatingProps.className === "string" ? floatingProps.className : undefined,
                  className,
                )}
              >
                {content}
                {withArrow && (
                  <FloatingArrow
                    ref={arrowRef}
                    context={context}
                    height={4}
                    width={9}
                    className={clsx(
                      types.getFloatingArrowVariantClassName(variant),
                      arrowClassName,
                    )}
                  />
                )}
              </FloatingContent>
            )}
          </>
        </WrapInPortal>
      )}
    </>
  );
};
