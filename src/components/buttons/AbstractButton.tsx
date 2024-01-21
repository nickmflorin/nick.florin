import NextLink from "next/link";

import clsx from "clsx";
import { type Required } from "utility-types";

import type * as types from "../types";

const getButtonClassName = <O extends types.ButtonOptions>(
  props: Required<
    Pick<
      types.AbstractButtonProps<O>,
      "variant" | "locked" | "loading" | "disabled" | "buttonType" | "className" | "size"
    >,
    "variant" | "locked" | "loading" | "disabled" | "buttonType"
  >,
) =>
  clsx(
    "button",
    `button--variant-${props.variant}`,
    `button--type-${props.buttonType}`,
    props.size && `button--size-${props.size}`,
    {
      "button--locked": props.locked,
      "button--loading": props.loading,
      "button--disabled": props.disabled,
    },
    props.className,
  );

export const AbstractButton = <O extends types.ButtonOptions>({
  disabled = false,
  locked = false,
  loading = false,
  buttonType,
  variant = "primary",
  size = "small",
  to,
  href,
  onClick,
  options,
  children,
  ...props
}: types.AbstractButtonProps<O>): JSX.Element => {
  const as = options?.as ?? "button";
  const className = getButtonClassName({
    disabled,
    locked,
    loading,
    buttonType,
    variant,
    className: props.className,
    size,
  });

  if (as === "a") {
    return (
      <a {...props} className={className} href={href}>
        <div className="button__content">{children}</div>
      </a>
    );
  } else if (as === "link") {
    if (to === undefined) {
      throw new Error("");
    }
    return (
      <NextLink {...props} href={to} className={className}>
        <div className="button__content">{children}</div>
      </NextLink>
    );
  }
  return (
    <button {...props} className={className} onClick={onClick}>
      <div className="button__content">{children}</div>
    </button>
  );
};
