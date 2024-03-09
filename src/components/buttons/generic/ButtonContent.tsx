import { type ReactNode } from "react";

import clsx from "clsx";

import { type MultipleIconProp, parseMultipleIconsProp } from "~/components/icons";
import { isIconProp, isDynamicIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { sizeToString, type ComponentProps } from "~/components/types";

import * as types from "../types";

export interface ButtonContentProps {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly icon?: MultipleIconProp;
  readonly iconSize?: types.ButtonIconSize;
  readonly loadingLocation?: "left" | "over" | "right";
}

const Spin = ({
  iconSize,
  isLoading,
  className,
}: {
  readonly iconSize?: types.ButtonIconSize;
  readonly isLoading: boolean;
  readonly className?: ComponentProps["className"];
}) => (
  <Spinner
    className={className}
    isLoading={isLoading}
    size={
      iconSize !== undefined && !types.ButtonDiscreteIconSizes.contains(iconSize)
        ? sizeToString(iconSize)
        : undefined
    }
  />
);

const RenderOrSpinner = ({
  children,
  isLoading,
  loadingLocation,
  location,
  iconSize,
}: {
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly loadingLocation?: "left" | "over" | "right";
  readonly location: "left" | "right";
  readonly iconSize?: types.ButtonIconSize;
}): JSX.Element => {
  if (isLoading && location === loadingLocation) {
    return <Spin iconSize={iconSize} isLoading={true} />;
  }
  return <>{children}</>;
};

export const ButtonContent = ({
  children,
  icon,
  isLoading = false,
  iconSize,
  loadingLocation = "left",
}: ButtonContentProps) => {
  const [leftIcon, rightIcon] = icon ? parseMultipleIconsProp(icon) : ([null, null] as const);

  return (
    <div className="button__content">
      {leftIcon && (isIconProp(leftIcon) || isDynamicIconProp(leftIcon)) ? (
        <Icon
          icon={leftIcon}
          isLoading={isLoading && loadingLocation === "left"}
          fit="square"
          dimension="height"
          /* If the icon size corresponds to a discrete size, it will be set with a class name
             by the abstract form of the button.  Otherwise, the size has to be provided directly
             to the Icon component, in the case that it is non discrete (e.g. 32px, not
             "small"). */
          size={
            iconSize !== undefined && !types.ButtonDiscreteIconSizes.contains(iconSize)
              ? sizeToString(iconSize)
              : undefined
          }
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
        <Icon
          icon={rightIcon}
          fit="square"
          dimension="height"
          isLoading={isLoading && loadingLocation === "right"}
          /* If the icon size corresponds to a discrete size, it will be set with a class name
             by the abstract form of the button.  Otherwise, the size has to be provided
             directly to the Icon component, in the case that it is non discrete (e.g. 32px, not
             "small"). */
          size={
            iconSize !== undefined && !types.ButtonDiscreteIconSizes.contains(iconSize)
              ? sizeToString(iconSize)
              : undefined
          }
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
