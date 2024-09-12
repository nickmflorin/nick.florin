import { pick } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";

import { classNames, sizeToString, type QuantitativeSizeString } from "~/components/types";
import { getTypographyClassName } from "~/components/types";

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
  | "variant"
  | "scheme"
  | "isLocked"
  | "isActive"
  | "isLoading"
  | "isDisabled"
  | "className"
  | "size"
  | "iconSize"
  | "fontWeight"
  | "radius"
  | "fontSize"
  | "fontFamily"
  | "transform"
  | "buttonType"
  | "lockedClassName"
  | "disabledClassName"
  | "loadingClassName"
  | "activeClassName";

export type ButtonClassNameProps<T extends types.ButtonType, E extends types.ButtonElement> = Pick<
  types.AbstractProps<T, E>,
  ButtonClassNamePropName
>;

const buttonSizeClassName = <T extends types.ButtonType, E extends types.ButtonElement>({
  size = "small",
  buttonType,
}: Pick<types.AbstractProps<T, E>, "size" | "buttonType">): string => {
  switch (buttonType) {
    case types.ButtonTypes.BUTTON:
      return types.ButtonDiscreteSizes.contains(size) ? `button--size-${size}` : "";
    case types.ButtonTypes.ICON_BUTTON:
      return types.ButtonDiscreteSizes.contains(size) ? `button--size-${size}` : "";
    case types.ButtonTypes.LINK:
      /* The size of the Link component is determined entirely from the line-height of the text
         it contains. */
      return "";
    case types.ButtonTypes.INLINE_LINK:
      /* The size of the Link component is determined entirely from the line-height of the text
         it contains. */
      return "";
    default:
      throw new UnreachableCaseError();
  }
};

export const getButtonClassName = <T extends types.ButtonType, E extends types.ButtonElement>(
  props: ButtonClassNameProps<T, E>,
) =>
  classNames(
    "button",
    props.buttonType === "button"
      ? `button--variant-${props.variant ?? "solid"}`
      : props.buttonType === "icon-button"
        ? `button--variant-${props.variant ?? "transparent"}`
        : "",
    `button--scheme-${props.scheme ?? "primary"}`,
    `button--type-${props.buttonType}`,
    // This will only include the class name if the size is a discrete size, ButtonDiscreteSize.
    buttonSizeClassName<T, E>(props),
    props.buttonType === "button" && props.fontSize ? `font-size-${props.fontSize}` : "",
    props.radius ? `button--radius-${props.radius}` : "",
    // Only include the icon size class name if the icon size is discrete.
    props.iconSize && types.ButtonDiscreteIconSizes.contains(props.iconSize)
      ? `button--icon-size-${props.iconSize}`
      : "",
    // Font size is not applicable for the IconButton.
    props.buttonType !== types.ButtonTypes.ICON_BUTTON
      ? getTypographyClassName(
          pick(props, ["fontFamily", "fontWeight", "transform", "fontSize"] as const),
        )
      : "",
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

type ButtonStylePropName = "style" | "size";

export type ButtonStyleProps<T extends types.ButtonType, E extends types.ButtonElement> = Pick<
  types.AbstractProps<T, E>,
  ButtonStylePropName
>;

export const getButtonStyle = <T extends types.ButtonType, E extends types.ButtonElement>(
  props: ButtonStyleProps<T, E>,
) =>
  !types.ButtonDiscreteIconSizes.contains(props.size) && props.size !== undefined
    ? {
        ...props.style,
        height: sizeToString(props.size, "px"),
        minHeight: sizeToString(props.size, "px"),
      }
    : props.style;

export type ButtonClassNameStyleProps<
  T extends types.ButtonType,
  E extends types.ButtonElement,
> = Pick<types.AbstractProps<T, E>, ButtonStylePropName | ButtonClassNamePropName>;
