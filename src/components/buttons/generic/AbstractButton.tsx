import NextLink from "next/link";
import React, { forwardRef } from "react";

import clsx from "clsx";
import omit from "lodash.omit";
import pick from "lodash.pick";

import type * as types from "../types";

import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

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
  >,
) =>
  clsx(
    "button",
    `button--variant-${props.variant ?? "primary"}`,
    `button--type-${props.buttonType}`,
    props.buttonType !== "link" ? `button--size-${props.size ?? "small"}` : null,
    props.buttonType === "button" && props.fontSize ? `font-size-${props.fontSize}` : null,
    props.iconSize && `button--icon-size-${props.iconSize}`,
    {
      "button--locked": props.isLocked,
      "button--loading": props.isLoading,
      "button--disabled": props.isDisabled,
      "button--active": props.isActive,
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

const INTERNAL_BUTTON_PROPS = [
  "options",
  "variant",
  "isLocked",
  "isActive",
  "isDisabled",
  "isLoading:",
  "iconSize",
  "fontWeight",
  "buttonType",
  "fontSize",
  "transform",
  "fontFamily",
] as const;

const toCoreButtonProps = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, (typeof INTERNAL_BUTTON_PROPS)[number]> => omit(props, INTERNAL_BUTTON_PROPS);

const AbstractButtonContent = <T extends types.ButtonType, O extends types.ButtonOptions>(
  props: Pick<types.AbstractProps<T, O>, "buttonType" | "children">,
): JSX.Element => {
  if (props.buttonType === "link") {
    return <>{props.children}</>;
  }
  return <div className="button__content">{props.children}</div>;
};

export const AbstractButton = forwardRef(
  <T extends types.ButtonType, O extends types.ButtonOptions>(
    props: types.AbstractProps<T, O>,
    ref: types.PolymorphicButtonRef<O>,
  ): JSX.Element => {
    const className = getButtonClassName(props);
    if (props.options?.as === "a") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "a" }>);
      return (
        <a {...ps} className={className} ref={ref as types.PolymorphicButtonRef<{ as: "a" }>}>
          <AbstractButtonContent buttonType={props.buttonType}>{ps.children}</AbstractButtonContent>
        </a>
      );
    } else if (props.options?.as === "link") {
      const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "link" }>);
      return (
        <NextLink
          {...ps}
          className={className}
          ref={ref as types.PolymorphicButtonRef<{ as: "a" }>}
        >
          <AbstractButtonContent buttonType={props.buttonType}>{ps.children}</AbstractButtonContent>
        </NextLink>
      );
    }
    const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "button" }>);
    return (
      <button
        {...ps}
        className={className}
        ref={ref as types.PolymorphicButtonRef<{ as: "button" }>}
      >
        <AbstractButtonContent buttonType={props.buttonType}>{ps.children}</AbstractButtonContent>
      </button>
    );
  },
) as {
  <T extends types.ButtonType, O extends types.ButtonOptions>(
    props: types.AbstractProps<T, O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};
