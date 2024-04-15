"use client";
import { type ReactNode, cloneElement, useMemo } from "react";

import { FloatingPortal } from "@floating-ui/react";

import { type ComponentProps } from "~/components/types";

import { Arrow } from "./Arrow";
import * as types from "./types";
import { useFloating, type UseFloatingConfig } from "./use-floating";

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

export interface FloatingProps extends UseFloatingConfig {
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
  readonly children: JSX.Element | ((params: types.FloatingRenderProps) => JSX.Element);
  readonly isDisabled?: boolean;
  readonly withArrow?: boolean;
  readonly arrowClassName?: ComponentProps["className"];
  readonly variant?: types.FloatingVariant;
}

export const Floating = ({
  children: _children,
  content: _content,
  inPortal,
  isDisabled,
  withArrow = true,
  arrowClassName,
  variant = types.FloatingVariants.SECONDARY,
  ...config
}: FloatingProps) => {
  const {
    refs,
    referenceProps,
    isOpen,
    floatingProps,
    maxHeight,
    floatingStyles,
    arrowRef,
    context,
  } = useFloating(config);

  const children = useMemo(() => {
    if (typeof _children === "function") {
      return _children({ ref: refs.setReference, params: referenceProps, isOpen });
    }
    return cloneElement(_children, {
      ref: refs.setReference,
      ...referenceProps,
    });
  }, [_children, refs, referenceProps, isOpen]);

  const content = useMemo(() => {
    const styles = maxHeight
      ? {
          ...floatingStyles,
          maxHeight: maxHeight ?? undefined,
        }
      : floatingStyles;
    if (typeof _content === "function") {
      return _content({
        ref: refs.setFloating,
        params: floatingProps,
        styles: styles,
      });
    }
    return cloneElement(
      _content,
      {
        ...floatingProps,
        ref: refs.setFloating,
        style: { ..._content.props.style, ...styles },
      },
      <>
        {_content.props.children}
        {context && withArrow && (
          <Arrow ref={arrowRef} variant={variant} context={context} className={arrowClassName} />
        )}
      </>,
    );
  }, [
    _content,
    floatingProps,
    refs,
    maxHeight,
    floatingStyles,
    context,
    arrowRef,
    arrowClassName,
    variant,
    withArrow,
  ]);

  return (
    <>
      {children}
      {isOpen && !isDisabled && (
        <ConditionalPortal inPortal={inPortal}>{content}</ConditionalPortal>
      )}
    </>
  );
};

export default Floating;
