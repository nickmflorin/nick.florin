import { type Ref } from 'react';

import * as types from '~/components/menus';
import { MenuItem } from '~/components/menus/MenuItem';
import { classNames, type ComponentProps } from '~/components/types';

export type CustomDataMenuItemProps = {
  readonly boldSubstrings?: string;
  readonly datum: types.DataMenuCustomModel;
  readonly isCurrentNavigation?: boolean;
  readonly onItemClick?: (
    e: types.MenuItemClickEvent,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly ref?: Ref<types.ConnectedMenuItemInstance>;
} & Omit<types.DataMenuItemClassNameProps<ComponentProps['className']>, 'itemSelectedClassName'> &
  types.DataMenuItemSizeProps;

export const CustomDataMenuItem = ({
  datum,
  itemCheckboxSize,
  itemClassName,
  itemDisabledClassName,
  itemHeight,
  itemIconClassName,
  itemIconSize,
  itemLoadingClassName,
  itemLockedClassName,
  itemNavigatedClassName,
  itemSpinnerClassName,
  itemSpinnerSize,
  onItemClick,
  ref,
  ...props
}: CustomDataMenuItemProps) => (
  <MenuItem
    {...props}
    actions={datum.actions}
    checkboxSize={datum.checkboxSize ?? itemCheckboxSize}
    className={classNames(itemClassName, datum.className)}
    disabledClassName={classNames(itemDisabledClassName, datum.disabledClassName)}
    height={itemHeight}
    icon={datum.icon}
    iconClassName={classNames(itemIconClassName, datum.iconClassName)}
    iconSize={datum.iconSize ?? itemIconSize}
    id={String(datum.id)}
    isDisabled={types.evalMenuItemFlag('isDisabled', datum)}
    isLoading={types.evalMenuItemFlag('isLoading', datum)}
    isLocked={types.evalMenuItemFlag('isLocked', datum)}
    loadingClassName={classNames(itemLoadingClassName, datum.loadingClassName)}
    lockedClassName={classNames(itemLockedClassName, datum.lockedClassName)}
    navigatedClassName={itemNavigatedClassName}
    onClick={(e, instance) => {
      onItemClick?.(e, instance);
      datum.onClick?.(e, instance);
    }}
    ref={ref}
    selectionIndicator='none'
    spinnerClassName={classNames(itemSpinnerClassName, datum.spinnerClassName)}
    spinnerSize={datum.spinnerSize ?? itemSpinnerSize}
  >
    {datum.renderer === undefined ? datum.label : params => datum.renderer?.(params)}
  </MenuItem>
);
