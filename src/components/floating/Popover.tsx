"use client";
import dynamic from "next/dynamic";
import { type ReactNode, cloneElement, useState, useEffect } from "react";

import { type ComponentProps } from "~/components/types";

import { usePopover, type UsePopoverConfig } from "./hooks/use-popover";
import * as types from "./types";

const Arrow = dynamic(() => import("./Arrow"), { ssr: false });
const FloatingPortal = dynamic(() => import("@floating-ui/react").then(mod => mod.FloatingPortal), {
  ssr: false,
});

const ConditionalPortal = ({
  children,
  inPortal = false,
}: {
  inPortal?: boolean;
  children: ReactNode;
}) => {
  if (inPortal) {
    return <FloatingPortal>{children}</FloatingPortal>;
  }
  return children;
};

export interface PopoverProps extends UsePopoverConfig {
  /**
   * The content that appears inside of the floating element.
   */
  readonly content: JSX.Element | ((props: types.FloatingContentRenderProps) => JSX.Element);
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
  readonly children: JSX.Element | ((params: types.PopoverRenderProps) => JSX.Element);
  readonly isDisabled?: boolean;
  readonly withArrow?: boolean;
  readonly arrowClassName?: ComponentProps["className"];
  readonly variant?: types.PopoverVariant;
}

export const Popover = ({
  children: _children,
  content: _content,
  inPortal,
  isDisabled,
  withArrow = true,
  arrowClassName,
  variant = types.PopoverVariants.SECONDARY,
  ...config
}: PopoverProps) => {
  const [content, setContent] = useState<JSX.Element | null>(null);
  const { refs, referenceProps, isOpen, floatingProps, floatingStyles, arrowRef, context } =
    usePopover(config);

  useEffect(() => {
    if (isOpen && !isDisabled) {
      let innerContent: JSX.Element;
      if (typeof _content === "function") {
        innerContent = _content({
          ref: refs.setFloating,
          params: floatingProps,
          styles: floatingStyles,
        });
      } else {
        innerContent = cloneElement(
          _content,
          {
            ...floatingProps,
            ref: refs.setFloating,
            style: { ..._content.props.style, ...floatingStyles },
          },
          <>
            {_content.props.children}
            {context && withArrow && (
              <Arrow
                ref={arrowRef}
                variant={variant}
                context={context}
                className={arrowClassName}
              />
            )}
          </>,
        );
      }
      setContent(<ConditionalPortal inPortal={inPortal}>{innerContent}</ConditionalPortal>);
    } else {
      setContent(null);
    }
  }, [
    _content,
    inPortal,
    floatingProps,
    refs,
    floatingStyles,
    context,
    arrowRef,
    arrowClassName,
    variant,
    withArrow,
    isOpen,
    isDisabled,
  ]);

  return (
    <>
      {typeof _children === "function"
        ? _children({ ref: refs.setReference, params: referenceProps, isOpen })
        : cloneElement(_children, {
            ref: refs.setReference,
            ...referenceProps,
          })}
      {content}
    </>
  );
};

export default Popover;
