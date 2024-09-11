import { type ReactNode } from "react";

import { type Required } from "utility-types";

import {
  isIconProp,
  type IconProp,
  type MultipleIconProp,
  parseMultipleIconsProp,
} from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";

import * as types from "../types";

export interface ButtonContentProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly icon?: MultipleIconProp;
  readonly gap?: Size;
  readonly iconSize?: types.ButtonIconSize;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly loadingLocation?: types.ButtonLoadingLocation;
}

const toIconSize = (size: types.ButtonIconSize | undefined): Size | undefined =>
  /* If the icon size corresponds to a discrete size, it will be set with a class name by the
     abstract form of the button.  Otherwise, the size has to be provided directly to the Icon
     component, in the case that it is non discrete (e.g. 32px, not "small"). */
  size !== undefined && !types.ButtonDiscreteIconSizes.contains(size)
    ? sizeToString(size, "px")
    : undefined;

interface SpinProps extends Pick<ButtonContentProps, "iconSize" | "isLoading" | "className"> {}

const Spin = ({ iconSize, isLoading, className }: SpinProps) => (
  <Spinner isLoading={isLoading} size={toIconSize(iconSize)} className={className} />
);

interface RenderOrSpinnerProps
  extends SpinProps,
    Required<
      Pick<
        ButtonContentProps,
        "children" | "loadingLocation" | "iconClassName" | "spinnerClassName"
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
  ...props
}: RenderOrSpinnerProps): JSX.Element => {
  if (isLoading && location === loadingLocation) {
    return (
      <Spin {...props} isLoading={true} className={classNames(iconClassName, spinnerClassName)} />
    );
  }
  return <>{children}</>;
};

interface ContentIconProps
  extends Pick<
    ButtonContentProps,
    "iconSize" | "isLoading" | "loadingLocation" | "iconClassName" | "spinnerClassName"
  > {
  readonly location: Exclude<types.ButtonLoadingLocation, "over">;
  readonly icon: IconProp;
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
    loadingClassName={classNames(iconClassName, spinnerClassName)}
    className={iconClassName}
  />
);

export const ButtonContent = ({
  children,
  icon,
  isLoading = false,
  gap,
  iconSize,
  iconClassName,
  spinnerClassName,
  loadingLocation: _loadingLocation,
  ...props
}: ButtonContentProps) => {
  const [leftIcon, rightIcon] = icon ? parseMultipleIconsProp(icon) : ([null, null] as const);
  const loadingLocation =
    _loadingLocation === undefined
      ? leftIcon
        ? "left"
        : rightIcon
          ? "right"
          : "left"
      : _loadingLocation;

  const commonIconProps = {
    isLoading,
    iconSize,
    iconClassName,
    spinnerClassName,
    loadingLocation,
  };

  return (
    <div
      {...props}
      className={classNames("button__content", props.className)}
      style={{ ...props.style, gap: gap !== undefined ? sizeToString(gap, "px") : undefined }}
    >
      {leftIcon && isIconProp(leftIcon) ? (
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
      <Spin
        iconSize={iconSize}
        className={classNames("absolute mx-auto", iconClassName, spinnerClassName)}
        isLoading={isLoading && loadingLocation === "over"}
      />
      {rightIcon && isIconProp(rightIcon) ? (
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
