import { type ForwardedRef, type JSX, type ReactNode, useMemo } from 'react';

import * as types from '~/components/menus';
import { MenuItem } from '~/components/menus/MenuItem';
import { classNames, type ComponentProps } from '~/components/types';

type DataMenuItemClassNameCallback<M extends types.DataMenuModel> = (
  datum: M,
) => ComponentProps['className'];

/**
 * Determines whether or not a class name related prop provided to the {@link DataMenuItem} was
 * provided as a callback that returns the class name for a given model, rather than as a static
 * class name value.
 *
 * The narrowing cannot be performed inline with `typeof`, because the class name type includes an
 * object type with a string index signature, which `typeof` narrows to the global `Function`
 * type - leaving behind a union that TypeScript does not treat as callable.
 */
const dataMenuItemClassNameIsCallback = <M extends types.DataMenuModel>(
  className: types.DataMenuItemClassName<M>,
): className is DataMenuItemClassNameCallback<M> => typeof className === 'function';

const evalDataMenuItemClassName = <M extends types.DataMenuModel>(
  datum: M,
  className: types.DataMenuItemClassName<M>,
): ComponentProps['className'] =>
  dataMenuItemClassNameIsCallback<M>(className) ? className(datum) : className;

export type DataMenuItemProps<M extends types.DataMenuModel> = {
  readonly boldSubstrings?: string;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
  readonly datum: M;
  readonly id: number | string;
  readonly isCurrentNavigation?: boolean;
  readonly isDescriptionVisible?: boolean;
  readonly onItemClick?: (
    e: types.MenuItemClickEvent,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
} & Omit<types.DataMenuItemFlagProps<M>, 'itemIsVisible'> &
  types.DataMenuItemAccessorProps<M> &
  types.DataMenuItemClassNameProps<types.DataMenuItemClassName<M>> &
  types.DataMenuItemSizeProps;

export const DataMenuItem = <M extends types.DataMenuModel>({
  children,
  datum,
  getItemDescription,
  getItemIcon,
  id,
  itemCheckboxSize,
  itemClassName,
  itemDisabledClassName,
  itemHeight,
  itemIconClassName,
  itemIconSize,
  itemIsDisabled,
  itemIsLoading,
  itemIsLocked,
  itemIsSelected,
  itemLoadingClassName,
  itemLockedClassName,
  itemNavigatedClassName,
  itemSelectedClassName,
  itemSpinnerClassName,
  itemSpinnerSize,
  onItemClick,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<types.ConnectedMenuItemInstance>;
} & DataMenuItemProps<M>): JSX.Element => {
  const icon = useMemo(() => {
    if (getItemIcon) {
      return (params: Omit<types.MenuItemRenderProps, `set${string}`>) => {
        const ic = getItemIcon(datum, params);
        return ic ?? datum.icon;
      };
    }
    return datum.icon;
  }, [datum, getItemIcon]);

  const description = useMemo(() => {
    if (getItemDescription) {
      return (params: types.MenuItemRenderProps) => {
        const desc = getItemDescription(datum, params);
        return desc ?? datum.description;
      };
    }
    return datum.description;
  }, [datum, getItemDescription]);

  return (
    <MenuItem
      {...props}
      actions={datum.actions}
      checkboxSize={datum.checkboxSize ?? itemCheckboxSize}
      className={classNames(evalDataMenuItemClassName(datum, itemClassName), datum.className)}
      description={description}
      disabledClassName={classNames(
        evalDataMenuItemClassName(datum, itemDisabledClassName),
        datum.disabledClassName,
      )}
      height={itemHeight}
      icon={icon}
      iconClassName={classNames(
        evalDataMenuItemClassName(datum, itemIconClassName),
        datum.iconClassName,
      )}
      iconSize={datum.iconSize ?? itemIconSize}
      id={String(id)}
      isDisabled={types.evalMenuItemFlag('isDisabled', datum, itemIsDisabled)}
      isLoading={types.evalMenuItemFlag('isLoading', datum, itemIsLoading)}
      isLocked={types.evalMenuItemFlag('isLocked', datum, itemIsLocked)}
      isSelected={types.evalMenuItemFlag('isSelected', datum, itemIsSelected)}
      loadingClassName={classNames(
        evalDataMenuItemClassName(datum, itemLoadingClassName),
        datum.loadingClassName,
      )}
      lockedClassName={classNames(
        evalDataMenuItemClassName(datum, itemLockedClassName),
        datum.lockedClassName,
      )}
      navigatedClassName={classNames(evalDataMenuItemClassName(datum, itemNavigatedClassName))}
      onClick={(e, instance) => {
        onItemClick?.(e, instance);
        datum.onClick?.(e, instance);
      }}
      ref={ref}
      selectedClassName={classNames(
        evalDataMenuItemClassName(datum, itemSelectedClassName),
        datum.selectedClassName,
      )}
      spinnerClassName={classNames(
        evalDataMenuItemClassName(datum, itemSpinnerClassName),
        datum.spinnerClassName,
      )}
      spinnerSize={datum.spinnerSize ?? itemSpinnerSize}
    >
      {params => (children ? children(datum, params) : datum.label)}
    </MenuItem>
  );
};
