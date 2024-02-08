"use client";
import { type ReactNode, useRef, cloneElement, useState, useMemo } from "react";

import {
  FloatingArrow,
  type Placement,
  arrow,
  useFloating,
  type ReferenceType,
  useInteractions,
  useHover,
} from "@floating-ui/react";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { FloatingContent } from "./FloatingContent";
import * as types from "./types";

export type FloatingRenderProps = {
  readonly params: ReturnType<ReturnType<typeof useInteractions>["getReferenceProps"]>;
  readonly ref: (node: ReferenceType | null) => void;
};

type FloatingTrigger = "hover";

export interface FloatingProps {
  /**
   * The content that appears inside of the floating element.
   */
  readonly content: ReactNode;
  readonly contentClassName?: ComponentProps["className"];
  readonly isOpen?: boolean;
  readonly triggers?: FloatingTrigger[];
  readonly variant?: types.FloatingVariant;
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
  readonly onOpenChange?: (value: boolean, evt: Event | undefined) => void;
}

export const Floating = ({
  children: _children,
  triggers = ["hover"],
  contentClassName,
  isOpen: propIsOpen,
  content,
  placement,
  variant = types.FloatingVariants.PRIMARY,
  onOpenChange,
}: FloatingProps) => {
  const [_isOpen, setIsOpen] = useState(false);

  /* Allow the open state of the floating element to be controlled externally to the component if
     desired. */
  const isOpen = propIsOpen === undefined ? _isOpen : propIsOpen;

  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (value: boolean, evt: Event | undefined) => {
      setIsOpen(value);
      onOpenChange?.(value, evt);
    },
    placement,
    middleware: [
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const hover = useHover(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    triggers.includes("hover") ? hover : undefined,
  ]);

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
      {isOpen && (
        <FloatingContent
          ref={refs.setFloating}
          variant={variant}
          style={floatingStyles}
          {...floatingProps}
          className={clsx(
            /* Typically, the floating props do not include a class name - but just in case, we want
               to merge it with the content class name, if it exists. */
            typeof floatingProps.className === "string" ? floatingProps.className : undefined,
            contentClassName,
          )}
        >
          {content}
          <FloatingArrow
            ref={arrowRef}
            context={context}
            height={4}
            width={9}
            className={types.getFloatingArrowVariantClassName(variant)}
          />
        </FloatingContent>
      )}
    </>
  );
};
