"use client";
import { cloneElement, useMemo } from "react";

import type * as types from "./types";

import { usePopover, type UsePopoverConfig } from "./hooks/use-popover";
import { PopoverContentWrapper, type PopoverContentWrapperProps } from "./PopoverContentWrapper";

export interface PopoverProps
  extends UsePopoverConfig,
    Omit<PopoverContentWrapperProps, "context" | "children"> {
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
  readonly children: JSX.Element | ((params: types.PopoverRenderProps) => JSX.Element);
  readonly content: types.PopoverContent;
}

export const Popover = ({
  children: _children,
  content,
  inPortal,
  isDisabled,
  withArrow = true,
  arrowClassName,
  outerContent,
  ...config
}: PopoverProps) => {
  const { refs, referenceProps, isOpen, ...rest } = usePopover(config);

  const children = useMemo(() => {
    if (typeof _children === "function") {
      return _children({ ref: refs.setReference, params: referenceProps, isOpen });
    }
    return cloneElement(_children, {
      ref: refs.setReference,
      ...referenceProps,
    });
  }, [_children, refs, referenceProps, isOpen]);

  return (
    <>
      {children}
      <PopoverContentWrapper
        context={{ refs, referenceProps, isOpen, ...rest }}
        outerContent={outerContent}
        arrowClassName={arrowClassName}
        withArrow={withArrow}
        inPortal={inPortal}
        isDisabled={isDisabled}
      >
        {content}
      </PopoverContentWrapper>
    </>
  );
};

export default Popover;
