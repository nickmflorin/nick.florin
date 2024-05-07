import dynamic from "next/dynamic";

import clsx from "clsx";

import type * as types from "../types";

import { isIconProp } from "~/components/icons";
import { withoutOverridingClassName, mergeIntoClassNames } from "~/components/types";

const Icon = dynamic(() => import("~/components/icons/Icon"));
const Spinner = dynamic(() => import("~/components/icons/Spinner"));

export interface MenuItemIconProps
  extends Pick<
    types.MenuModel,
    "iconClassName" | "spinnerClassName" | "icon" | "iconSize" | "isLoading"
  > {}

export const MenuItemIcon = ({
  icon,
  iconClassName,
  iconSize = "18px",
  isLoading = false,
  spinnerClassName,
}: MenuItemIconProps) => {
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
