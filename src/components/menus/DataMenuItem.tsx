import { forwardRef, type ForwardedRef, type ReactNode, useMemo } from "react";

import * as types from "~/components/menus";
import { MenuItem } from "~/components/menus/MenuItem";
import { classNames } from "~/components/types";

export type DataMenuItemProps<M extends types.DataMenuModel> = Omit<
  types.DataMenuItemFlagProps<M>,
  "itemIsVisible"
> &
  types.DataMenuItemClassNameProps<types.DataMenuItemClassName<M>> &
  types.DataMenuItemAccessorProps<M> &
  types.DataMenuItemSizeProps & {
    readonly datum: M;
    readonly id: string | number;
    readonly includeDescription?: boolean;
    readonly isCurrentNavigation?: boolean;
    readonly selectionIndicator?: types.MenuItemSelectionIndicator;
    readonly boldSubstrings?: string;
    readonly onItemClick?: (
      e: types.MenuItemClickEvent,
      instance: types.ConnectedMenuItemInstance,
    ) => void;
    readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
  };

export const DataMenuItem = forwardRef(
  <M extends types.DataMenuModel>(
    {
      datum,
      id,
      itemClassName,
      itemIconSize,
      itemSpinnerSize,
      itemCheckboxSize,
      itemDisabledClassName,
      itemSelectedClassName,
      itemSpinnerClassName,
      itemIconClassName,
      itemLoadingClassName,
      itemLockedClassName,
      itemHeight,
      itemNavigatedClassName,
      itemIsDisabled,
      itemIsSelected,
      itemIsLoading,
      itemIsLocked,
      onItemClick,
      getItemIcon,
      getItemDescription,
      children,
      ...props
    }: DataMenuItemProps<M>,
    ref?: ForwardedRef<types.ConnectedMenuItemInstance>,
  ) => {
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
        id={String(id)}
        ref={ref}
        actions={datum.actions}
        height={itemHeight}
        icon={icon}
        description={description}
        iconSize={datum.iconSize ?? itemIconSize}
        spinnerSize={datum.spinnerSize ?? itemSpinnerSize}
        checkboxSize={datum.checkboxSize ?? itemCheckboxSize}
        iconClassName={classNames(
          typeof itemIconClassName === "function" ? itemIconClassName(datum) : itemIconClassName,
          datum.iconClassName,
        )}
        navigatedClassName={classNames(
          typeof itemNavigatedClassName === "function"
            ? itemNavigatedClassName(datum)
            : itemNavigatedClassName,
        )}
        spinnerClassName={classNames(
          typeof itemSpinnerClassName === "function"
            ? itemSpinnerClassName(datum)
            : itemSpinnerClassName,
          datum.spinnerClassName,
        )}
        className={classNames(
          typeof itemClassName === "function" ? itemClassName(datum) : itemClassName,
          datum.className,
        )}
        disabledClassName={classNames(
          typeof itemDisabledClassName === "function"
            ? itemDisabledClassName(datum)
            : itemDisabledClassName,
          datum.disabledClassName,
        )}
        loadingClassName={classNames(
          typeof itemLoadingClassName === "function"
            ? itemLoadingClassName(datum)
            : itemLoadingClassName,
          datum.loadingClassName,
        )}
        selectedClassName={classNames(
          typeof itemSelectedClassName === "function"
            ? itemSelectedClassName(datum)
            : itemSelectedClassName,
          datum.selectedClassName,
        )}
        lockedClassName={classNames(
          typeof itemLockedClassName === "function"
            ? itemLockedClassName(datum)
            : itemLockedClassName,
          datum.lockedClassName,
        )}
        isDisabled={types.evalMenuItemFlag("isDisabled", datum, itemIsDisabled)}
        isLocked={types.evalMenuItemFlag("isLocked", datum, itemIsLocked)}
        isLoading={types.evalMenuItemFlag("isLoading", datum, itemIsLoading)}
        isSelected={types.evalMenuItemFlag("isSelected", datum, itemIsSelected)}
        onClick={(e, instance) => {
          onItemClick?.(e, instance);
          datum.onClick?.(e, instance);
        }}
      >
        {params => (children ? children?.(datum, params) : datum.label)}
      </MenuItem>
    );
  },
) as {
  <M extends types.DataMenuModel>(
    props: DataMenuItemProps<M> & {
      readonly ref?: ForwardedRef<types.ConnectedMenuItemInstance>;
    },
  ): JSX.Element;
};
