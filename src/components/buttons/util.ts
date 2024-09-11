import clsx from "clsx";
import { pick } from "lodash-es";

import { type ComponentProps, mergeIntoClassNames } from "~/components/types";
import { sizeToString } from "~/components/types/sizes";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/types/typography";

import * as types from "./types";

type ButtonClassNamePropName =
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
  | "activeClassName";

export type ButtonClassNameProps<T extends types.ButtonType, F extends types.ButtonForm> = Pick<
  types.AbstractProps<T, F>,
  ButtonClassNamePropName
>;

const buttonSizeClassName = <T extends types.ButtonType, F extends types.ButtonForm>({
  size = "small",
  buttonType,
}: Pick<types.AbstractProps<T, F>, "size" | "buttonType">): string | null => {
  if (buttonType === "icon-button") {
    return types.ButtonDiscreteSizes.contains(size) ? `button--size-${size}` : null;
  } else if (buttonType === "link") {
    return null;
  } else if (!types.ButtonDiscreteSizes.contains(size)) {
    throw new Error("");
  }
  return `button--size-${size}`;
};

export const getButtonClassName = <T extends types.ButtonType, F extends types.ButtonForm>(
  props: ButtonClassNameProps<T, F>,
) =>
  clsx(
    "button",
    `button--variant-${props.variant ?? "primary"}`,
    `button--type-${props.buttonType}`,
    // The size may be provided as a size string (e.g. 32px).
    buttonSizeClassName<T, F>(props),
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
          fontSize:
            props.buttonType === "link"
              ? (props.fontSize as BaseTypographyProps["fontSize"] | undefined)
              : undefined,
        } as BaseTypographyProps)
      : "",
    /* These class names should override any class name that may already exist in the props if the
       button is in the given state. */
    mergeIntoClassNames(props.className, {
      [clsx(props.lockedClassName)]: props.isLocked,
      [clsx(props.loadingClassName)]: props.isLoading,
      [clsx(props.disabledClassName)]: props.isDisabled,
      [clsx(props.activeClassName)]: props.isActive,
    }),
    props.className,
  );

type ButtonStylePropName = "style" | "size";

export type ButtonStyleProps<T extends types.ButtonType, F extends types.ButtonForm> = Pick<
  types.AbstractProps<T, F>,
  ButtonStylePropName
>;

export const getButtonStyle = <T extends types.ButtonType, F extends types.ButtonForm>(
  props: ButtonStyleProps<T, F>,
) =>
  /* Note: A potentially non-discrete icon size string provided as a prop must be handled by each
     individual button component that extends the AbstractButton.  This is because the icon size
     must be provided directly to the Icon component being rendered. */
  !types.ButtonDiscreteIconSizes.contains(props.size) && props.size !== undefined
    ? { ...props.style, height: sizeToString(props.size, "px") }
    : props.style;

export type ButtonClassNameStyleProps<
  T extends types.ButtonType,
  F extends types.ButtonForm,
> = Pick<types.AbstractProps<T, F>, ButtonStylePropName | ButtonClassNamePropName>;

export const getButtonComponentProps = <T extends types.ButtonType, F extends types.ButtonForm>(
  props: ButtonClassNameStyleProps<T, F>,
): ComponentProps => ({
  style: getButtonStyle<T, F>(props),
  className: getButtonClassName<T, F>(props),
});
