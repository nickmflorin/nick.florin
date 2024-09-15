import { forwardRef, type ForwardedRef, useState, useImperativeHandle, useMemo } from "react";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { classNames } from "~/components/types";

import { MenuItem } from "./MenuItem";
import * as types from "./types";

export const MenuItemModelRenderer = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      id,
      model,
      options,
      /* value,
         menuValue, */
      itemClassName,
      iconClassName,
      spinnerClassName,
      iconSize,
      itemIsDisabled,
      itemDisabledClassName,
      itemSelectedClassName,
      itemIsSelected,
      itemIsLoading,
      itemLoadingClassName,
      itemIsLocked,
      itemLockedClassName,
      itemHeight,
      itemIsVisible,
      onClick,
      children,
    }: types.MenuItemModelRendererProps<M, O>,
    ref: ForwardedRef<types.MenuItemInstance>,
  ) => {
    const { open } = useDrawers();

    const [_isLoading, setLoading] = useState(false);
    const [_isDisabled, setDisabled] = useState(false);
    const [_isLocked, setLocked] = useState(false);

    const label = types.getModelLabel(model, options);

    useImperativeHandle(ref, () => ({
      setLoading,
      setDisabled,
      setLocked,
    }));

    const href = useMemo(() => types.getModelHref(model, options), [model, options]);

    const drawer = useMemo(() => types.getModelDrawer(model, options), [model, options]);

    const actions = useMemo(() => types.getModelActions(model, options), [model, options]);

    return (
      <MenuItem
        id={id ? String(id) : undefined}
        actions={actions}
        height={itemHeight}
        isMulti={options.isMulti}
        href={href}
        icon={model.icon}
        iconSize={model.iconSize ?? iconSize}
        iconClassName={classNames(model.iconClassName, iconClassName)}
        spinnerClassName={classNames(model.spinnerClassName, spinnerClassName)}
        className={typeof itemClassName === "function" ? itemClassName(model) : itemClassName}
        disabledClassName={
          typeof itemDisabledClassName === "function"
            ? itemDisabledClassName(model)
            : itemDisabledClassName
        }
        selectedClassName={
          typeof itemSelectedClassName === "function"
            ? itemSelectedClassName(model)
            : itemSelectedClassName
        }
        loadingClassName={
          typeof itemLoadingClassName === "function"
            ? itemLoadingClassName(model)
            : itemLoadingClassName
        }
        lockedClassName={
          typeof itemLockedClassName === "function"
            ? itemLockedClassName(model)
            : itemLockedClassName
        }
        isDisabled={
          types.evalMenuItemFlag("isDisabled", itemIsDisabled, model) ||
          _isDisabled ||
          model.isDisabled
        }
        isVisible={types.evalMenuItemFlag("isVisible", itemIsVisible, model)}
        isLocked={
          types.evalMenuItemFlag("isLocked", itemIsLocked, model) || _isLocked || model.isLocked
        }
        isLoading={
          types.evalMenuItemFlag("isLoading", itemIsLoading, model) || _isLoading || model.isLoading
        }
        isSelected={Boolean(
          types.evalMenuItemFlag("isSelected", itemIsSelected, model) || model.isSelected,
        )}
        onClick={e => {
          onClick(e);
          model.onClick?.(e, { setDisabled, setLoading, setLocked });
          if (drawer) {
            return open(drawer.id, drawer.props);
          }
        }}
      >
        {children ? children(model) : label}
      </MenuItem>
    );
  },
) as {
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    props: types.MenuItemModelRendererProps<M, O> & {
      readonly ref: ForwardedRef<types.MenuItemInstance>;
    },
  ): JSX.Element;
};
