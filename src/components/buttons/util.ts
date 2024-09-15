import { classNames, sizeToString, type QuantitativeSizeString } from "~/components/types";

import * as types from "./types";

export const toIconSize = (
  size: types.ButtonIconSize | undefined,
): QuantitativeSizeString<"px"> | undefined =>
  /* If the icon size corresponds to a discrete size, it will be set with a class name by the
     abstract form of the button.  Otherwise, the size has to be provided directly to the Icon
     component, in the case that it is non discrete (e.g. 32px, not "small"). */
  size !== undefined && !types.ButtonDiscreteIconSizes.contains(size)
    ? sizeToString(size, "px")
    : undefined;

type ButtonClassNamePropName =
  | "scheme"
  | "isLocked"
  | "isActive"
  | "isLoading"
  | "isDisabled"
  | "className"
  | "radius"
  | "buttonType"
  | "lockedClassName"
  | "disabledClassName"
  | "loadingClassName"
  | "activeClassName";

export type ButtonClassNameProps<E extends types.ButtonElement> = Pick<
  types.AbstractButtonProps<E>,
  ButtonClassNamePropName
>;

export const buttonSizeClassName = (size: types.ButtonSize = "small"): string =>
  types.ButtonDiscreteSizes.contains(size) ? `button--size-${size}` : "";

export const buttonIconSizeClassName = (iconSize?: types.ButtonIconSize): string =>
  // Only include the icon size class name if the icon size is discrete.
  iconSize && types.ButtonDiscreteIconSizes.contains(iconSize)
    ? `button--icon-size-${iconSize}`
    : "";

export const getButtonClassName = <E extends types.ButtonElement>(props: ButtonClassNameProps<E>) =>
  classNames(
    "button",
    `button--scheme-${props.scheme ?? "primary"}`,
    `button--type-${props.buttonType}`,
    props.radius ? `button--radius-${props.radius}` : "",
    props.className,
    /* These class names should override any class name that may already exist in the props if the
       button is in the given state - so they should come after 'props.className'. */
    {
      [classNames("button--locked", props.lockedClassName)]: props.isLocked,
      [classNames("button--loading", props.loadingClassName)]: props.isLoading,
      [classNames("button--disabled", props.disabledClassName)]: props.isDisabled,
      [classNames("button--active", props.activeClassName)]: props.isActive,
    },
  );

export type ButtonSizeStyleProps = {
  readonly style?: React.CSSProperties;
  readonly size?: types.ButtonSize;
};

export const getButtonSizeStyle = (props: ButtonSizeStyleProps) =>
  !types.ButtonDiscreteIconSizes.contains(props.size) && props.size !== undefined
    ? {
        ...props.style,
        height: sizeToString(props.size, "px"),
        minHeight: sizeToString(props.size, "px"),
      }
    : props.style;
