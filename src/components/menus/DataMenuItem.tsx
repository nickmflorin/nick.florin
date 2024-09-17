import { forwardRef, type ForwardedRef, type ReactNode, useMemo } from "react";

import { type IconProp, type IconName } from "~/components/icons";
import * as types from "~/components/menus";
import { MenuItem } from "~/components/menus/MenuItem";
import { classNames, type QuantitativeSize } from "~/components/types";

export type DataMenuItemProps<M extends types.DataMenuModel> = types.MenuItemFlagProps<M> & {
  readonly datum: M;
  readonly id: string | number;
  readonly includeDescription?: boolean;
  readonly isCurrentNavigation?: boolean;
  readonly itemClassName?: types.DataMenuItemClassName<M>;
  readonly itemHeight?: QuantitativeSize<"px">;
  readonly itemNavigatedClassName?: types.DataMenuItemClassName<M>;
  readonly itemSpinnerClassName?: types.DataMenuItemClassName<M>;
  readonly itemIconClassName?: types.DataMenuItemClassName<M>;
  readonly itemIconProps?: types.MenuItemIconProps;
  readonly itemIconSize?: QuantitativeSize<"px">;
  readonly itemDisabledClassName?: types.DataMenuItemClassName<M>;
  readonly itemLoadingClassName?: types.DataMenuItemClassName<M>;
  readonly itemLockedClassName?: types.DataMenuItemClassName<M>;
  readonly itemSelectedClassName?: types.DataMenuItemClassName<M>;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly getItemIcon?: (
    datum: M,
    params: types.MenuItemRenderProps,
  ) => IconProp | IconName | JSX.Element | undefined;
  readonly getItemDescription?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: types.MenuItemInstance,
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
      itemDisabledClassName,
      itemSelectedClassName,
      itemSpinnerClassName,
      itemIconClassName,
      itemIconProps,
      itemLoadingClassName,
      itemLockedClassName,
      selectionIndicator,
      itemHeight,
      itemNavigatedClassName,
      includeDescription,
      itemIsDisabled,
      itemIsSelected,
      itemIsLoading,
      itemIsLocked,
      itemIsVisible,
      onClick,
      getItemIcon,
      getItemDescription,
      children,
      ...props
    }: DataMenuItemProps<M>,
    ref: ForwardedRef<types.MenuItemInstance>,
  ) => {
    const icon = useMemo(() => {
      if (getItemIcon) {
        return (params: types.MenuItemRenderProps) => {
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
        includeDescription={includeDescription}
        iconSize={datum.iconSize ?? itemIconSize}
        selectionIndicator={selectionIndicator}
        iconProps={{ ...itemIconProps, ...datum.iconProps }}
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
        isDisabled={types.evalMenuItemFlag("isDisabled", itemIsDisabled, datum) || datum.isDisabled}
        isVisible={
          types.evalMenuItemFlag("isVisible", itemIsVisible, datum) !== false &&
          datum.isVisible !== false
        }
        isLocked={types.evalMenuItemFlag("isLocked", itemIsLocked, datum) || datum.isLocked}
        isLoading={types.evalMenuItemFlag("isLoading", itemIsLoading, datum) || datum.isLoading}
        isSelected={Boolean(
          types.evalMenuItemFlag("isSelected", itemIsSelected, datum) || datum.isSelected,
        )}
        onClick={(e, instance) => {
          onClick?.(e, instance);
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
      readonly ref: ForwardedRef<types.MenuItemInstance>;
    },
  ): JSX.Element;
};
