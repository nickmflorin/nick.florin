import url from "url";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import React, { forwardRef } from "react";

import { omit } from "lodash-es";

import type * as types from "~/components/buttons";
import { getButtonClassName } from "~/components/buttons/util";
import { classNames } from "~/components/types";
import { type ComponentProps, parseDataAttributes } from "~/components/types";

type InternalPropName = keyof Required<types.AbstractInternalButtonProps<types.ButtonElement>>;

/* We use a map here for extra type safety, because it ensures that all of the internal props are
   accounted for in the map. */
const INTERNAL_BUTTON_PROPS = {
  className: true,
  style: true,
  element: true,
  scheme: true,
  radius: true,
  isLocked: true,
  isActive: true,
  isDisabled: true,
  isLoading: true,
  buttonType: true,
  lockedClassName: true,
  loadingClassName: true,
  activeClassName: true,
  disabledClassName: true,
  openInNewTab: true,
  tourId: true,
} as const satisfies { [key in InternalPropName]: true };

const toNativeButtonProps = <E extends types.ButtonElement>(
  props: types.AbstractButtonProps<E>,
): types.NativeButtonProps<E> => {
  const keys = Object.keys(INTERNAL_BUTTON_PROPS) as InternalPropName[];
  /* It is really annoying that we have to do the type coercion like this - but I cannot seem to
     find another way around it.  Something to look into in the future, but it is not a super
     risky coercion because of the type safety around the definition of 'INTERNAL_BUTTON_PROPS'. */
  return omit(props, keys) as unknown as types.NativeButtonProps<E>;
};

const NativeButton = forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & ComponentProps>(
  (props, ref) => <button {...props} ref={ref} className={classNames(props.className)} />,
);

const NativeAnchor = forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<"a">, "href"> & {
    readonly href?: url.UrlObject | string;
  } & ComponentProps
>(({ href, className, ...props }, ref) => (
  <a
    {...props}
    ref={ref}
    href={typeof href === "string" ? href : href !== undefined ? url.format(href) : undefined}
    className={classNames(className)}
  />
));

const NativeLink = forwardRef<HTMLAnchorElement, NextLinkProps & ComponentProps>(
  ({ className, ...props }, ref) => (
    <NextLink {...props} ref={ref} className={classNames(className)} />
  ),
);

const NativeDiv = forwardRef<HTMLDivElement, React.ComponentProps<"div"> & ComponentProps>(
  (props, ref) => <div {...props} ref={ref} className={classNames(props.className)} />,
);

export const AbstractButton = forwardRef(
  <E extends types.ButtonElement>(
    props: types.AbstractButtonProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ): JSX.Element => {
    const className = getButtonClassName(props);
    const nativeProps = {
      ...toNativeButtonProps(props),
      ...parseDataAttributes({
        tourId: props.tourId,
        isDisabled: props.isDisabled,
        isLocked: props.isLocked,
        isActive: props.isActive,
        isLoading: props.isLoading
      }),
    };

    switch (props.element) {
      case "a": {
        const openInNewTab = props.openInNewTab ?? false;
        return (
          <NativeAnchor
            {...(nativeProps as types.NativeButtonProps<"a">)}
            style={props.style}
            className={className}
            target={openInNewTab ? "_blank" : (nativeProps as types.NativeButtonProps<"a">).target}
            rel={
              openInNewTab
                ? "noopener noreferrer"
                : (nativeProps as types.NativeButtonProps<"a">).rel
            }
            ref={ref as types.PolymorphicButtonRef<"a">}
          />
        );
      }
      case "link": {
        return (
          <NativeLink
            {...(nativeProps as types.NativeButtonProps<"link">)}
            style={props.style}
            data-attr-tour-id={props.tourId}
            className={className}
            ref={ref as types.PolymorphicButtonRef<"a">}
          />
        );
      }
      case "div": {
        return (
          <NativeDiv
            {...(nativeProps as types.NativeButtonProps<"div">)}
            style={props.style}
            className={className}
            data-attr-tour-id={props.tourId}
            ref={ref as types.PolymorphicButtonRef<"div">}
          />
        );
      }
      default: {
        return (
          <NativeButton
            type="button"
            {...(nativeProps as types.NativeButtonProps<"button">)}
            style={props.style}
            className={className}
            disabled={props.isDisabled}
            data-attr-tour-id={props.tourId}
            ref={ref as types.PolymorphicButtonRef<"button">}
          />
        );
      }
    }
  },
) as {
  <E extends types.ButtonElement>(
    props: types.AbstractButtonProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};
