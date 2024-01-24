import NextLink from "next/link";

import clsx from "clsx";
import { type Required } from "utility-types";

import type * as types from "./types";

const getButtonClassName = <O extends types.ButtonOptions>(
  props: Required<
    Pick<
      types.AbstractButtonProps<O>,
      | "variant"
      | "isLocked"
      | "isActive"
      | "isLoading"
      | "isDisabled"
      | "buttonType"
      | "className"
      | "size"
    >,
    "variant" | "isLocked" | "isActive" | "isLoading" | "isDisabled" | "buttonType"
  >,
) =>
  clsx(
    "button",
    `button--variant-${props.variant}`,
    `button--type-${props.buttonType}`,
    props.size && `button--size-${props.size}`,
    {
      "button--locked": props.isLocked,
      "button--loading": props.isLoading,
      "button--disabled": props.isDisabled,
      "button--active": props.isActive,
    },
    props.className,
  );

export const AbstractButton = <O extends types.ButtonOptions>({
  isDisabled = false,
  isLocked = false,
  isLoading = false,
  isActive = false,
  buttonType,
  variant = "primary",
  size = "small",
  to,
  href,
  onClick,
  options,
  children,
  onMouseEnter,
  ...props
}: types.AbstractButtonProps<O>): JSX.Element => {
  const as = options?.as ?? "button";
  const className = getButtonClassName({
    isDisabled,
    isLocked,
    isLoading,
    isActive,
    buttonType,
    variant,
    className: props.className,
    size,
  });

  if (as === "a") {
    return (
      <a
        {...props}
        className={className}
        href={href}
        onMouseEnter={onMouseEnter as types.AbstractButtonProps<{ as: "a" }>["onMouseEnter"]}
      >
        <div className="button__content">{children}</div>
      </a>
    );
  } else if (as === "link") {
    if (to === undefined) {
      throw new Error("");
    }
    return (
      <NextLink
        {...props}
        href={to}
        className={className}
        onMouseEnter={onMouseEnter as types.AbstractButtonProps<{ as: "link" }>["onMouseEnter"]}
      >
        <div className="button__content">{children}</div>
      </NextLink>
    );
  }
  return (
    <button
      {...props}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter as types.AbstractButtonProps<{ as: "button" }>["onMouseEnter"]}
    >
      <div className="button__content">{children}</div>
    </button>
  );
};
