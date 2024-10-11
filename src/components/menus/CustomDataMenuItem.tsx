import { forwardRef, type ForwardedRef } from "react";

import * as types from "~/components/menus";
import { MenuItem } from "~/components/menus/MenuItem";
import { type ComponentProps, classNames } from "~/components/types";

export type CustomDataMenuItemProps = Omit<
  types.DataMenuItemClassNameProps<ComponentProps["className"]>,
  "itemSelectedClassName"
> & {
  readonly datum: types.DataMenuCustomModel;
  readonly isCurrentNavigation?: boolean;
  readonly boldSubstrings?: string;
  readonly onItemClick?: (
    e: types.MenuItemClickEvent,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
};

export const CustomDataMenuItem = forwardRef(
  (
    {
      datum,
      itemClassName,
      itemIconSize,
      itemDisabledClassName,
      itemSpinnerClassName,
      itemIconClassName,
      itemIconProps,
      itemLoadingClassName,
      itemLockedClassName,
      itemHeight,
      itemNavigatedClassName,
      onItemClick,
      ...props
    }: CustomDataMenuItemProps,
    ref?: ForwardedRef<types.ConnectedMenuItemInstance>,
  ) => (
    <MenuItem
      {...props}
      id={String(datum.id)}
      ref={ref}
      actions={datum.actions}
      height={itemHeight}
      icon={datum.icon}
      iconSize={datum.iconSize ?? itemIconSize}
      iconProps={{ ...itemIconProps, ...datum.iconProps }}
      selectionIndicator="none"
      iconClassName={classNames(itemIconClassName, datum.iconClassName)}
      navigatedClassName={itemNavigatedClassName}
      spinnerClassName={classNames(itemSpinnerClassName, datum.spinnerClassName)}
      className={classNames(itemClassName, datum.className)}
      disabledClassName={classNames(itemDisabledClassName, datum.disabledClassName)}
      loadingClassName={classNames(itemLoadingClassName, datum.loadingClassName)}
      lockedClassName={classNames(itemLockedClassName, datum.lockedClassName)}
      isDisabled={types.evalMenuItemFlag("isDisabled", datum)}
      isLocked={types.evalMenuItemFlag("isLocked", datum)}
      isLoading={types.evalMenuItemFlag("isLoading", datum)}
      onClick={(e, instance) => {
        onItemClick?.(e, instance);
        datum.onClick?.(e, instance);
      }}
    >
      {datum.renderer !== undefined ? params => datum.renderer?.(params) : datum.label}
    </MenuItem>
  ),
);
