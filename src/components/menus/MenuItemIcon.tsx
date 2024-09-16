import type { SpinnerProps, IconProp, IconName } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import type * as types from "~/components/menus";
import { classNames, type ComponentProps, type QuantitativeSize } from "~/components/types";

export interface MenuItemIconProps {
  readonly icon?: IconProp | IconName;
  readonly iconProps?: types.MenuItemIconProps;
  readonly iconSize?: QuantitativeSize<"px">;
  readonly spinnerProps?: Omit<SpinnerProps, "isLoading" | "size" | "className">;
  readonly isLoading?: boolean;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
}

export const MenuItemIcon = ({
  icon,
  iconClassName,
  isLoading = false,
  spinnerClassName,
  spinnerProps,
  iconSize = "18px",
  iconProps,
}: MenuItemIconProps) => {
  if (icon) {
    if (isLoading) {
      return (
        <Spinner
          {...spinnerProps}
          className={classNames("text-gray-600", iconClassName, spinnerClassName)}
          isLoading={isLoading}
          size={iconSize}
        />
      );
    }
    return (
      <Icon
        {...iconProps}
        icon={icon}
        className={classNames("text-gray-600", iconClassName)}
        size={iconSize}
      />
    );
  }
  return <></>;
};
