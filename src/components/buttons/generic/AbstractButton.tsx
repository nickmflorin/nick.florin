import NextLink from "next/link";
import React, { forwardRef } from "react";

import omit from "lodash.omit";

import type * as types from "../types";

import { getButtonClassName, getButtonStyle } from "~/components/buttons/util";

const INTERNAL_BUTTON_PROPS = [
  "as",
  "variant",
  "isLocked",
  "isActive",
  "isDisabled",
  "isLoading",
  "iconSize",
  "fontWeight",
  "buttonType",
  "fontSize",
  "transform",
  "fontFamily",
  "lockedClassName",
  "loadingClassName",
  "activeClassName",
  "disabledClassName",
  "tourId",
] as const;

const toCoreButtonProps = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, (typeof INTERNAL_BUTTON_PROPS)[number]> => omit(props, INTERNAL_BUTTON_PROPS);

export const AbstractButton = forwardRef(
  <T extends types.ButtonType, F extends types.ButtonForm>(
    props: types.AbstractProps<T, F>,
    ref: types.PolymorphicButtonRef<F>,
  ): JSX.Element => {
    const className = getButtonClassName(props);
    const style = getButtonStyle(props);
    if (props.as === "a") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, "a">);
      return (
        <a
          {...ps}
          data-attr-tour-id={props.tourId}
          className={className}
          style={style}
          ref={ref as types.PolymorphicButtonRef<"a">}
        >
          {ps.children}
        </a>
      );
    } else if (props.as === "link") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, "link">);
      return (
        <NextLink
          {...ps}
          data-attr-tour-id={props.tourId}
          className={className}
          style={style}
          ref={ref as types.PolymorphicButtonRef<"a">}
        >
          {ps.children}
        </NextLink>
      );
    }
    const ps = toCoreButtonProps(props as types.AbstractProps<T, "button">);
    return (
      <button
        type="button"
        {...ps}
        data-attr-tour-id={props.tourId}
        className={className}
        disabled={props.isDisabled}
        style={style}
        ref={ref as types.PolymorphicButtonRef<"button">}
      >
        {ps.children}
      </button>
    );
  },
) as {
  <T extends types.ButtonType, F extends types.ButtonForm>(
    props: types.AbstractProps<T, F> & { readonly ref?: types.PolymorphicButtonRef<F> },
  ): JSX.Element;
};
