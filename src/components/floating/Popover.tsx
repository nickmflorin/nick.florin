'use client';
import { cloneElement, type JSX, useMemo } from 'react';

import type * as types from './types';

import { usePopover, type UsePopoverConfig } from './hooks/use-popover';
import { PopoverContentWrapper, type PopoverContentWrapperProps } from './PopoverContentWrapper';

export interface PopoverProps
  extends UsePopoverConfig, Omit<PopoverContentWrapperProps, 'children' | 'context'> {
  /**
   * The element that should trigger the floating content to appear and/or disappear, depending on
   * its interaction state - such as hovered, clicked, etc. Can be provided either as a render prop
   * or a JSX element, in which case the ref will be injected into the element's props dynamically.
   *
   * Generally, it is simpler and more explicit to provide the children as a render prop, and
   * manually pass the `ref` and other reference props to the element that should trigger the
   * floating content to appear.
   *
   * However, this is problematic with Next.js's server components, because a function cannot be
   * passed from a server component to a child component. In those cases, the server component can
   * simply provide the children as a JSX element, and allow the ref and other reference props to
   * be injected into the element in this component dynamically, on the client.
   *
   * In both cases, the target element must expose the reference props and `ref`, but when they are
   * automatically injected, TypeScript cannot verify whether the component accepts those props,
   * which can lead to bugs in the floating element's usage.
   */
  readonly children: ((params: types.PopoverRenderProps) => JSX.Element) | JSX.Element;
  readonly content: types.PopoverContent;
}

export const Popover = ({
  arrowClassName,
  children: _children,
  content,
  hasArrow = true,
  isDisabled,
  isInPortal,
  outerContent,
  ...config
}: PopoverProps) => {
  const { isOpen, referenceProps, refs, ...rest } = usePopover({ ...config, autoUpdate: true });

  const children = useMemo(() => {
    if (typeof _children === 'function') {
      return _children({ isOpen, params: referenceProps, ref: refs.setReference.bind(refs) });
    }
    return cloneElement(_children, {
      ref: refs.setReference.bind(refs),
      ...referenceProps,
    });
  }, [_children, refs, referenceProps, isOpen]);

  return (
    <>
      {children}
      <PopoverContentWrapper
        arrowClassName={arrowClassName}
        context={{ isOpen, referenceProps, refs, ...rest }}
        hasArrow={hasArrow}
        isDisabled={isDisabled}
        isInPortal={isInPortal}
        outerContent={outerContent}
      >
        {content}
      </PopoverContentWrapper>
    </>
  );
};
