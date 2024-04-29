import { type ReactNode } from "react";

import clsx from "clsx";

import type * as types from "../types";

import { isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { Checkbox } from "~/components/input/Checkbox";
import { Actions } from "~/components/structural/Actions";
import {
  type ComponentProps,
  type HTMLElementProps,
  sizeToString,
  withoutOverridingClassName,
  sizeToNumber,
  type QuantitativeSize,
  mergeIntoClassNames,
} from "~/components/types";
import { ShowHide } from "~/components/util";

export interface MenuItemProps
  extends ComponentProps,
    HTMLElementProps<"div">,
    Pick<
      types.MenuModel,
      | "iconClassName"
      | "spinnerClassName"
      | "icon"
      | "iconSize"
      | "isDisabled"
      | "isLoading"
      | "isLocked"
      | "isVisible"
      | "actions"
    > {
  readonly height?: QuantitativeSize<"px">;
  readonly isSelected: boolean;
  readonly selectedClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly children: ReactNode;
  readonly isMulti?: boolean;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
}

const MenuItemIcon = ({
  icon,
  iconClassName,
  iconSize = "18px",
  isLoading = false,
  spinnerClassName,
}: Pick<
  MenuItemProps,
  "icon" | "iconClassName" | "iconSize" | "isLoading" | "spinnerClassName"
>) => {
  if (icon) {
    if (isIconProp(icon)) {
      return (
        <Icon
          icon={icon}
          className={clsx(
            withoutOverridingClassName("text-gray-600", iconClassName),
            iconClassName,
          )}
          size={iconSize}
          isLoading={isLoading}
        />
      );
    } else if (isLoading) {
      return (
        <Spinner
          className={clsx(
            withoutOverridingClassName(
              "text-gray-600",
              mergeIntoClassNames(iconClassName, spinnerClassName),
            ),
            spinnerClassName,
          )}
          isLoading={isLoading}
          size={iconSize}
          dimension="height"
        />
      );
    }
    return icon;
  }
  return <></>;
};

export const MenuItem = ({
  height,
  actions,
  isSelected = false,
  isMulti = false,
  selectedClassName,
  loadingClassName,
  lockedClassName,
  disabledClassName,
  spinnerClassName,
  children,
  isDisabled = false,
  isLocked = false,
  isVisible = true,
  icon,
  iconClassName,
  iconSize = "16px",
  isLoading = false,
  selectionIndicator = "checkbox",
  ...props
}: MenuItemProps): JSX.Element => (
  <ShowHide show={isVisible}>
    <div
      {...props}
      onClick={e => {
        if (!isDisabled && !isLocked && !isLoading) {
          props.onClick?.(e);
        }
      }}
      className={clsx(
        "menu__item",
        withoutOverridingClassName("px-[10px]", props.className),
        withoutOverridingClassName("py-[6px]", props.className),
        {
          [clsx("menu__item--selected", selectedClassName)]: isSelected,
          [clsx("menu__item--loading", loadingClassName)]: isLoading,
          [clsx("disabled", disabledClassName)]: isDisabled,
          [clsx("menu__item--locked", lockedClassName)]: isLocked,
        },
        mergeIntoClassNames(props.className, {
          [clsx(selectedClassName)]: isSelected,
          [clsx(loadingClassName)]: isLoading,
          [clsx(disabledClassName)]: isDisabled,
          [clsx(lockedClassName)]: isLocked,
        }),
      )}
      style={
        height !== undefined
          ? {
              ...props.style,
              height: sizeToString(height, "px"),
              lineHeight: `${sizeToNumber(height) - 2 * 6}px`,
            }
          : props.style
      }
    >
      <ShowHide show={isMulti && selectionIndicator === "checkbox"}>
        <Checkbox readOnly value={isSelected} isDisabled={isDisabled} isLocked={isLocked} />
      </ShowHide>
      <MenuItemIcon
        icon={icon}
        iconSize={iconSize}
        iconClassName={iconClassName}
        isLoading={isLoading}
        spinnerClassName={spinnerClassName}
      />
      <div className="menu__item__content">{children}</div>
      {/* Only show the spinner to the right (instead of over the icon) if the icon is not
          defined. */}
      {icon === undefined && (
        <Spinner
          className={clsx(
            withoutOverridingClassName(
              "text-gray-600",
              mergeIntoClassNames(iconClassName, spinnerClassName),
            ),
            mergeIntoClassNames(iconClassName, spinnerClassName),
          )}
          isLoading={isLoading}
          size="18px"
          dimension="height"
        />
      )}
      <Actions actions={actions ?? null} />
    </div>
  </ShowHide>
);
