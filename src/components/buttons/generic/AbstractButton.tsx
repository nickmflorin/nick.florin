import NextLink from "next/link";
import React, { forwardRef } from "react";

import clsx from "clsx";
import omit from "lodash.omit";
import pick from "lodash.pick";

import { sizeToString } from "~/components/types";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

import * as types from "../types";

const buttonSizeClassName = <T extends types.ButtonType, O extends types.ButtonOptions>({
  size = "small",
  buttonType,
}: Pick<types.AbstractProps<T, O>, "size" | "buttonType">): string | null => {
  if (buttonType === "icon-button") {
    return types.ButtonDiscreteSizes.contains(size) ? `button--size-${size}` : null;
  } else if (buttonType === "link") {
    return null;
  } else if (!types.ButtonDiscreteSizes.contains(size)) {
    throw new Error("");
  }
  return `button--size-${size}`;
};

const getButtonClassName = <T extends types.ButtonType, O extends types.ButtonOptions>(
  props: Pick<
    types.AbstractProps<T, O>,
    | "variant"
    | "isLocked"
    | "isActive"
    | "isLoading"
    | "isDisabled"
    | "className"
    | "size"
    | "iconSize"
    | "fontWeight"
    | "fontSize"
    | "fontFamily"
    | "transform"
    | "buttonType"
    | "lockedClassName"
    | "disabledClassName"
    | "loadingClassName"
    | "activeClassName"
  >,
) =>
  clsx(
    "button",
    `button--variant-${props.variant ?? "primary"}`,
    `button--type-${props.buttonType}`,
    // The size may be provided as a size string (e.g. 32px).
    buttonSizeClassName(props),
    props.buttonType === "button" && props.fontSize ? `font-size-${props.fontSize}` : null,
    // The icon size may be provided as a size string (e.g. 32px).
    props.iconSize && types.ButtonDiscreteIconSizes.contains(props.iconSize)
      ? `button--icon-size-${props.iconSize}`
      : "",
    {
      [clsx("button--locked", props.lockedClassName)]: props.isLocked,
      [clsx("button--loading", props.loadingClassName)]: props.isLoading,
      [clsx("button--disabled", props.disabledClassName)]: props.isDisabled,
      [clsx("button--active", props.activeClassName)]: props.isActive,
    },
    props.buttonType !== "icon-button"
      ? getTypographyClassName({
          ...pick(props, ["fontFamily", "fontWeight", "transform"] as const),
          size:
            props.buttonType === "link"
              ? (props.fontSize as BaseTypographyProps["size"] | undefined)
              : undefined,
        } as BaseTypographyProps)
      : "",
    props.className,
  );

const getButtonStyle = <T extends types.ButtonType, O extends types.ButtonOptions>(
  props: Pick<types.AbstractProps<T, O>, "size" | "style">,
) =>
  /* Note: A potentially non-discrete icon size string provided as a prop must be handled by each
     individual button component that extends the AbstractButton.  This is because the icon size
     must be provided directly to the Icon component being rendered. */
  !types.ButtonDiscreteIconSizes.contains(props.size) && props.size !== undefined
    ? { ...props.style, height: sizeToString(props.size) }
    : props.style;

const INTERNAL_BUTTON_PROPS = [
  "options",
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
] as const;

const toCoreButtonProps = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, (typeof INTERNAL_BUTTON_PROPS)[number]> => omit(props, INTERNAL_BUTTON_PROPS);

export const AbstractButton = forwardRef(
  <T extends types.ButtonType, O extends types.ButtonOptions>(
    props: types.AbstractProps<T, O>,
    ref: types.PolymorphicButtonRef<O>,
  ): JSX.Element => {
    const className = getButtonClassName(props);
    const style = getButtonStyle(props);
    if (props.options?.as === "a") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "a" }>);
      return (
        <a
          {...ps}
          className={className}
          style={style}
          ref={ref as types.PolymorphicButtonRef<{ as: "a" }>}
        >
          {ps.children}
        </a>
      );
    } else if (props.options?.as === "link") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "link" }>);
      return (
        <NextLink
          {...ps}
          className={className}
          style={style}
          ref={ref as types.PolymorphicButtonRef<{ as: "a" }>}
        >
          {ps.children}
        </NextLink>
      );
    }
    const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "button" }>);
    return (
      <button
        type="button"
        {...ps}
        className={className}
        disabled={props.isDisabled}
        style={style}
        ref={ref as types.PolymorphicButtonRef<{ as: "button" }>}
      >
        {ps.children}
      </button>
    );
  },
) as {
  <T extends types.ButtonType, O extends types.ButtonOptions>(
    props: types.AbstractProps<T, O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};
