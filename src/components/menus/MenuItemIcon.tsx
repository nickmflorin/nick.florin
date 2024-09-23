import type { IconProp, IconName } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import type * as types from "~/components/menus";
import { classNames, type ComponentProps, type QuantitativeSize } from "~/components/types";

export interface MenuItemIconProps {
  readonly icon: IconProp | IconName;
  readonly iconProps?: types.MenuItemIconProps;
  readonly iconSize?: QuantitativeSize<"px">;
  readonly isLoading?: boolean;
  readonly iconClassName?: ComponentProps["className"];
}

export const MenuItemIcon = ({
  icon,
  iconClassName,
  isLoading = false,
  iconSize = "18px",
  iconProps,
}: MenuItemIconProps) => (
  <Icon
    {...iconProps}
    isLoading={isLoading}
    icon={icon}
    className={classNames("text-gray-600", iconClassName)}
    size={iconSize}
  />
);
