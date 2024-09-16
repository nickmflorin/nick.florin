"use client";
import { cloneElement, useMemo, useCallback } from "react";

import type * as types from "./types";

import { type ComponentProps } from "~/components/types";

import { Arrow } from "./Arrow";
import { ConditionalPortal } from "./ConditionalPortal";

export interface PopoverContentWrapperProps {
  /**
   * The content that appears inside of the floating element.
   */
  readonly children: types.PopoverContent;
  readonly inPortal?: boolean;
  readonly isDisabled?: boolean;
  readonly withArrow?: boolean;
  readonly arrowClassName?: ComponentProps["className"];
  readonly context: types.PopoverContext;
  readonly outerContent?: (params: { children: JSX.Element }) => JSX.Element;
}

export const PopoverContentWrapper = ({
  children: _children,
  outerContent,
  inPortal,
  isDisabled,
  withArrow = true,
  arrowClassName,
  context: { floatingProps, floatingStyles, refs, arrowRef, context, isOpen, setIsOpen },
}: PopoverContentWrapperProps) => {
  const cloneAndRender = useCallback(
    (element: JSX.Element) => {
      const ele = outerContent ? outerContent({ children: element }) : element;
      return cloneElement(
        ele,
        {
          ...floatingProps,
          ref: refs.setFloating,
          style: { ...ele.props.style, ...floatingStyles },
        },
        <>
          {ele.props.children}
          {context && withArrow && (
            <Arrow ref={arrowRef} context={context} className={arrowClassName} />
          )}
        </>,
      );
    },
    [
      arrowRef,
      context,
      withArrow,
      floatingProps,
      refs,
      floatingStyles,
      arrowClassName,
      outerContent,
    ],
  );

  const children = useMemo(() => {
    if (isOpen && !isDisabled) {
      if (typeof _children === "function") {
        return _children({
          ref: refs.setFloating,
          isOpen,
          setIsOpen,
          params: floatingProps,
          styles: floatingStyles,
        });
      }
      return cloneAndRender(_children);
    }
    return <></>;
  }, [
    _children,
    isOpen,
    isDisabled,
    floatingProps,
    floatingStyles,
    refs,
    setIsOpen,
    cloneAndRender,
  ]);

  if (isOpen && !isDisabled) {
    return <ConditionalPortal inPortal={inPortal}>{children}</ConditionalPortal>;
  }
  return <></>;
};

export default PopoverContentWrapper;
