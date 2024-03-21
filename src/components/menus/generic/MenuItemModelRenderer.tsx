import { forwardRef, type ForwardedRef, useState, useImperativeHandle, useMemo } from "react";

import isEqual from "lodash.isequal";

import * as types from "../types";

import { MenuItem } from "./MenuItem";

export const MenuItemModelRenderer = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      id,
      isReady = true,
      model,
      options,
      value,
      menuValue,
      itemClassName,
      itemIsDisabled,
      itemDisabledClassName,
      itemIsLoading,
      itemLoadingClassName,
      itemIsLocked,
      itemLockedClassName,
      itemSelectedClassName,
      itemIsVisible,
      onClick,
      children,
    }: types.MenuItemModelRendererProps<M, O>,
    ref: ForwardedRef<types.MenuItemInstance>,
  ) => {
    const [_isLoading, setLoading] = useState(false);
    const [_isDisabled, setDisabled] = useState(false);
    const [_isLocked, setLocked] = useState(false);

    const label = types.getModelLabel(model, options);

    const isSelected = useMemo(() => {
      if (typeof menuValue !== "string") {
        if (options.isMulti) {
          if (!Array.isArray(menuValue)) {
            throw new Error("Unexpectedly encountered non-iterable value for a multi-valued Menu.");
          }
          return menuValue.filter(vi => isEqual(vi, value)).length > 0;
        }
        return isEqual(menuValue, value);
      }
      return false;
    }, [menuValue, value, options.isMulti]);

    useImperativeHandle(ref, () => ({
      setLoading,
      setDisabled,
      setLocked,
    }));

    return (
      <MenuItem
        id={id}
        isMulti={options.isMulti}
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
        isDisabled={types.evalMenuItemFlag("isDisabled", itemIsDisabled, model) || _isDisabled}
        isVisible={types.evalMenuItemFlag("isVisible", itemIsVisible, model)}
        isLocked={types.evalMenuItemFlag("isLocked", itemIsLocked, model) || !isReady || _isLocked}
        isLoading={types.evalMenuItemFlag("isLoading", itemIsLoading, model) || _isLoading}
        isSelected={isSelected}
        onClick={onClick}
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
