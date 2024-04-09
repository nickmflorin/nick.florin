import { type ReactNode } from "react";

import clsx from "clsx";

import {
  isIconProp,
  isDynamicIconProp,
  type IconProp,
  type DynamicIconProp,
  type MultipleIconProp,
  parseMultipleIconsProp,
} from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { type Size, sizeToString, type ComponentProps } from "~/components/types";

import * as types from "../types";

const toIconSize = (size: types.ButtonIconSize | undefined): Size | undefined =>
  /* If the icon size corresponds to a discrete size, it will be set with a class name by the
     abstract form of the button.  Otherwise, the size has to be provided directly to the Icon
     component, in the case that it is non discrete (e.g. 32px, not "small"). */
  size !== undefined && !types.ButtonDiscreteIconSizes.contains(size)
    ? sizeToString(size)
    : undefined;

const Spin = ({
  iconSize,
  isLoading,
  className,
}: {
  readonly iconSize?: types.ButtonIconSize;
  readonly isLoading: boolean;
  readonly className?: ComponentProps["className"];
}) => <Spinner className={className} isLoading={isLoading} size={toIconSize(iconSize)} />;

const RenderOrSpinner = ({
  children,
  isLoading,
  loadingLocation,
  location,
  iconSize,
}: {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly loadingLocation: types.ButtonLoadingLocation;
  readonly location: Exclude<types.ButtonLoadingLocation, "over">;
  readonly iconSize?: types.ButtonIconSize;
}): JSX.Element => {
  if (isLoading && location === loadingLocation) {
    return <Spin iconSize={iconSize} isLoading={true} />;
  }
  return <>{children}</>;
};

const ContentIcon = ({
  isLoading,
  iconSize,
  icon,
  loadingLocation,
  location,
}: {
  readonly icon: IconProp | DynamicIconProp;
  readonly iconSize?: types.ButtonIconSize;
  readonly isLoading: boolean;
  readonly loadingLocation: types.ButtonLoadingLocation;
  readonly location: Exclude<types.ButtonLoadingLocation, "over">;
}) => (
  <Icon
    icon={icon}
    isLoading={isLoading && loadingLocation === location}
    fit="square"
    dimension="height"
    size={toIconSize(iconSize)}
  />
);

export interface ButtonContentProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly icon?: MultipleIconProp;
  readonly gap?: Size;
  readonly iconSize?: types.ButtonIconSize;
  readonly loadingLocation?: types.ButtonLoadingLocation;
}

export const ButtonContent = ({
  children,
  icon,
  isLoading = false,
  gap,
  iconSize,
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
  return (
    <div
      {...props}
      className={clsx("button__content", props.className)}
      style={{ ...props.style, gap: gap !== undefined ? sizeToString(gap) : undefined }}
    >
      {leftIcon && (isIconProp(leftIcon) || isDynamicIconProp(leftIcon)) ? (
        <ContentIcon
          icon={leftIcon}
          isLoading={isLoading}
          loadingLocation={loadingLocation}
          location="left"
        />
      ) : (
        <RenderOrSpinner isLoading={isLoading} loadingLocation={loadingLocation} location="left">
          {leftIcon}
        </RenderOrSpinner>
      )}
      <div
        className={clsx("button__sub-content", {
          "opacity-0": isLoading && loadingLocation === "over",
        })}
      >
        {children}
      </div>
      <Spin
        iconSize={iconSize}
        isLoading={isLoading && loadingLocation === "over"}
        className="absolute mx-auto"
      />
      {rightIcon && (isIconProp(rightIcon) || isDynamicIconProp(rightIcon)) ? (
        <ContentIcon
          icon={rightIcon}
          isLoading={isLoading}
          loadingLocation={loadingLocation}
          location="right"
        />
      ) : rightIcon ? (
        <RenderOrSpinner isLoading={isLoading} loadingLocation={loadingLocation} location="right">
          {rightIcon}
        </RenderOrSpinner>
      ) : (
        <></>
      )}
    </div>
  );
};
