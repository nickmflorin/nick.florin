import dynamic from "next/dynamic";

import type * as types from "../types";

import { isIconProp } from "~/components/icons";
import { classNames } from "~/components/types";

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
          className={classNames("text-gray-600", iconClassName)}
          size={iconSize}
          isLoading={isLoading}
        />
      );
    } else if (isLoading) {
      return (
        <Spinner
          className={classNames("text-gray-600", iconClassName, spinnerClassName)}
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
