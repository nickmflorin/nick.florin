"use client";
import { cloneElement, useMemo, useCallback } from "react";

import { type ComponentProps } from "~/components/types";

import { Arrow } from "./Arrow";
import { ConditionalPortal } from "./ConditionalPortal";
import * as types from "./types";

export type PopoverContentRenderFn = (props: types.FloatingContentRenderProps) => JSX.Element;

export type PopoverContent = JSX.Element | PopoverContentRenderFn;

export interface PopoverContentWrapperProps {
  /**
   * The content that appears inside of the floating element.
   */
  readonly content: PopoverContent;
  readonly outerContent?: (params: { children: JSX.Element }) => JSX.Element;
  readonly inPortal?: boolean;
  readonly isDisabled?: boolean;
  readonly withArrow?: boolean;
  readonly arrowClassName?: ComponentProps["className"];
  readonly variant?: types.PopoverVariant;
  readonly context: types.PopoverContext;
}

export const PopoverContentWrapper = ({
  content: _content,
  outerContent,
  inPortal,
  isDisabled,
  withArrow = true,
  arrowClassName,
  variant = types.PopoverVariants.SECONDARY,
  context: { floatingProps, floatingStyles, refs, arrowRef, context, isOpen },
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
            <Arrow ref={arrowRef} variant={variant} context={context} className={arrowClassName} />
          )}
        </>,
      );
    },
    [
      arrowRef,
      variant,
      context,
      withArrow,
      floatingProps,
      refs,
      floatingStyles,
      arrowClassName,
      outerContent,
    ],
  );

  const content = useMemo(() => {
    if (isOpen && !isDisabled) {
      if (typeof _content === "function") {
        return _content({
          ref: refs.setFloating,
          params: floatingProps,
          styles: floatingStyles,
        });
      }
      return cloneAndRender(_content);
    }
    return <></>;
  }, [_content, isOpen, isDisabled, floatingProps, floatingStyles, refs, cloneAndRender]);

  if (isOpen && !isDisabled) {
    return <ConditionalPortal inPortal={inPortal}>{content}</ConditionalPortal>;
  }
  return <></>;
};

export default PopoverContentWrapper;
