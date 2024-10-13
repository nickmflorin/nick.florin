import { type ReactNode } from "react";

import { type Required } from "utility-types";

import * as types from "~/components/buttons";
import { toIconSize } from "~/components/buttons/util";
import { isIconProp, type IconProp, type IconName } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { classNames } from "~/components/types";
import { type ComponentProps, sizeToString, type QuantitativeSize } from "~/components/types";

export interface ButtonContentProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly icon?: types.ButtonIconProp;
  readonly gap?: QuantitativeSize<"px">;
  readonly iconSize?: types.ButtonIconSize;
  readonly spinnerSize?: QuantitativeSize<"px">;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly loadingLocation?: types.ButtonLoadingLocation;
}

interface RenderOrSpinnerProps
  extends Required<
    Pick<
      ButtonContentProps,
      | "children"
      | "loadingLocation"
      | "iconClassName"
      | "spinnerClassName"
      | "spinnerSize"
      | "isLoading"
      | "iconSize"
    >,
    "loadingLocation"
  > {
  readonly location: Exclude<types.ButtonLoadingLocation, "over">;
}

const RenderOrSpinner = ({
  children,
  isLoading,
  loadingLocation,
  location,
  iconClassName,
  spinnerClassName,
  spinnerSize,
  iconSize,
}: RenderOrSpinnerProps): JSX.Element => {
  if (isLoading && location === loadingLocation) {
    return (
      <Spinner
        size={spinnerSize ?? toIconSize(iconSize)}
        isLoading={true}
        className={classNames(iconClassName, spinnerClassName)}
      />
    );
  }
  return <>{children}</>;
};

interface ContentIconProps
  extends Pick<
    ButtonContentProps,
    | "iconSize"
    | "isLoading"
    | "loadingLocation"
    | "iconClassName"
    | "spinnerClassName"
    | "spinnerSize"
  > {
  readonly location: Exclude<types.ButtonLoadingLocation, "over">;
  readonly icon: IconProp | IconName;
}

const ContentIcon = ({
  isLoading,
  iconSize,
  icon,
  loadingLocation,
  location,
  spinnerClassName,
  iconClassName,
}: ContentIconProps) => (
  <Icon
    icon={icon}
    isLoading={isLoading && loadingLocation === location}
    fit="square"
    dimension="height"
    size={toIconSize(iconSize)}
    spinnerClassName={classNames(iconClassName, spinnerClassName)}
    className={iconClassName}
  />
);

const parseIconsAndLoadingLocation = ({
  icon,
  loadingLocation,
}: Pick<ButtonContentProps, "icon" | "loadingLocation">) => {
  const [leftIcon, rightIcon] = icon ? types.parseButtonIcons(icon) : ([null, null] as const);
  const defaultLoadingLocation = leftIcon ? "left" : rightIcon ? "right" : "left";
  return {
    leftIcon,
    rightIcon,
    loadingLocation: loadingLocation ?? defaultLoadingLocation,
  };
};

export const ButtonContent = ({
  children,
  icon,
  isLoading = false,
  gap,
  iconSize,
  iconClassName,
  spinnerClassName,
  loadingLocation: _loadingLocation,
  spinnerSize,
  ...props
}: ButtonContentProps) => {
  const { leftIcon, rightIcon, loadingLocation } = parseIconsAndLoadingLocation({
    icon,
    loadingLocation: _loadingLocation,
  });

  const commonIconProps = {
    isLoading,
    iconSize,
    iconClassName,
    spinnerClassName,
    loadingLocation,
    spinnerSize,
  };

  return (
    <div
      {...props}
      className={classNames("button__content", props.className)}
      style={{ ...props.style, gap: gap !== undefined ? sizeToString(gap, "px") : undefined }}
    >
      {leftIcon && (isIconProp(leftIcon) || typeof leftIcon === "string") ? (
        <ContentIcon {...commonIconProps} icon={leftIcon} location="left" />
      ) : (
        <RenderOrSpinner {...commonIconProps} location="left">
          {leftIcon}
        </RenderOrSpinner>
      )}
      <div
        className={classNames("button__sub-content", {
          "opacity-0": isLoading && loadingLocation === "over",
        })}
      >
        {children}
      </div>
      <Spinner
        size={spinnerSize ?? toIconSize(iconSize)}
        className={classNames("absolute mx-auto", iconClassName, spinnerClassName)}
        isLoading={isLoading && loadingLocation === "over"}
      />
      {rightIcon && (isIconProp(rightIcon) || typeof rightIcon === "string") ? (
        <ContentIcon {...commonIconProps} icon={rightIcon} location="right" />
      ) : rightIcon ? (
        <RenderOrSpinner {...commonIconProps} location="right">
          {rightIcon}
        </RenderOrSpinner>
      ) : (
        <></>
      )}
    </div>
  );
};
