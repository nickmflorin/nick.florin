'use client';
import {
  cloneElement,
  type CSSProperties,
  type JSX,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';

import type * as types from './types';

import { type ComponentProps } from '~/components/types';

import { Arrow } from './Arrow';
import { ConditionalPortal } from './ConditionalPortal';

/**
 * The props of the element that the popover's floating content is cloned from.
 *
 * React types the props of a `JSX.Element` as `any`, so the props that this component reads off of
 * the element have to be described explicitly. The index signature preserves the arbitrary other
 * props that the element being cloned may define.
 */
interface ClonedElementProps {
  readonly children?: ReactNode;
  readonly [prop: string]: unknown;
  readonly style?: CSSProperties;
}

export interface PopoverContentWrapperProps {
  readonly arrowClassName?: ComponentProps['className'];
  readonly children: types.PopoverContent;
  readonly context: types.PopoverContext;
  readonly hasArrow?: boolean;
  readonly isDisabled?: boolean;
  readonly isInPortal?: boolean;
  readonly outerContent?: types.PopoverOuterContent;
}

export const PopoverContentWrapper = ({
  arrowClassName,
  children: _children,
  context: { arrowRef, context, floatingProps, floatingStyles, isOpen, refs, setIsOpen },
  hasArrow = true,
  isDisabled,
  isInPortal,
  outerContent,
}: PopoverContentWrapperProps) => {
  const setFloatingRef = useCallback((node: HTMLElement | null) => refs.setFloating(node), [refs]);

  const cloneAndRender = useCallback(
    (element: JSX.Element) => {
      const ele: ReactElement<ClonedElementProps> = outerContent
        ? outerContent({
            children: element,
            isOpen,
            params: floatingProps,
            ref: setFloatingRef,
            setIsOpen,
            styles: floatingStyles,
          })
        : element;
      return cloneElement(
        ele,
        {
          ...floatingProps,
          ref: setFloatingRef,
          style: { ...ele.props.style, ...floatingStyles },
        },
        <>
          {ele.props.children}
          {hasArrow && <Arrow className={arrowClassName} context={context} ref={arrowRef} />}
        </>,
      );
    },
    [
      arrowRef,
      context,
      hasArrow,
      floatingProps,
      setFloatingRef,
      floatingStyles,
      arrowClassName,
      isOpen,
      setIsOpen,
      outerContent,
    ],
  );

  const children = useMemo(() => {
    if (isOpen && !isDisabled) {
      if (typeof _children === 'function') {
        return _children({
          isOpen,
          params: floatingProps,
          ref: setFloatingRef,
          setIsOpen,
          styles: floatingStyles,
        });
      }
      return cloneAndRender(_children);
    }
    return null;
  }, [
    _children,
    isOpen,
    isDisabled,
    floatingProps,
    floatingStyles,
    setFloatingRef,
    setIsOpen,
    cloneAndRender,
  ]);

  if (isOpen && !isDisabled) {
    return <ConditionalPortal inPortal={isInPortal}>{children}</ConditionalPortal>;
  }
  return null;
};
