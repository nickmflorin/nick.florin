import NextLink from "next/link";
import React from "react";

import clsx from "clsx";
import omit from "lodash.omit";

import type * as types from "./types";

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
    | "buttonType"
  >,
) =>
  clsx(
    "button",
    `button--variant-${props.variant ?? "primary"}`,
    `button--type-${props.buttonType}`,
    `button--size-${props.size ?? "small"}`,
    props.iconSize && `button--icon-size-${props.iconSize}`,
    props.fontWeight && `font-weight-${props.fontWeight}`,
    {
      "button--locked": props.isLocked,
      "button--loading": props.isLoading,
      "button--disabled": props.isDisabled,
      "button--active": props.isActive,
    },
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
] as const;

const toCoreButtonProps = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, (typeof INTERNAL_BUTTON_PROPS)[number]> => omit(props, INTERNAL_BUTTON_PROPS);

export const AbstractButton = <T extends types.ButtonType, O extends types.ButtonOptions>(
  props: types.AbstractProps<T, O>,
): JSX.Element => {
  const className = getButtonClassName(props);

  if (props.options?.as === "a") {
    const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "a" }>);
    return (
      <a {...ps} className={className}>
        <div className="button__content">{ps.children}</div>
      </a>
    );
  } else if (props.options?.as === "link") {
    const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "link" }>);
    return (
      <NextLink {...ps} className={className}>
        <div className="button__content">{ps.children}</div>
      </NextLink>
    );
  }
  const ps = toCoreButtonProps(props as types.AbstractProps<T, { as: "button" }>);
  return (
    <button {...ps} className={className}>
      <div className="button__content">{ps.children}</div>
    </button>
  );
};

type R = React.FC;
