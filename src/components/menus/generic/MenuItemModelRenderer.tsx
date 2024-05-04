import Link from "next/link";
import { forwardRef, type ForwardedRef, useState, useImperativeHandle, useMemo } from "react";

import clsx from "clsx";
import isEqual from "lodash.isequal";

import { useDrawers } from "~/components/drawers/hooks";

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
      iconClassName,
      spinnerClassName,
      iconSize,
      itemIsDisabled,
      itemDisabledClassName,
      itemIsLoading,
      itemLoadingClassName,
      itemIsLocked,
      itemLockedClassName,
      itemSelectedClassName,
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

    const isSelected = useMemo(() => {
      if (menuValue !== types.VALUE_NOT_APPLICABLE) {
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

    const href = useMemo(() => types.getModelHref(model, options), [model, options]);

    const drawer = useMemo(() => types.getModelDrawer(model, options), [model, options]);

    const actions = useMemo(() => types.getModelActions(model, options), [model, options]);

    const Item = (
      <MenuItem
        id={id ? String(id) : undefined}
        actions={actions}
        height={itemHeight}
        isMulti={options.isMulti}
        icon={model.icon}
        iconSize={model.iconSize ?? iconSize}
        iconClassName={clsx(model.iconClassName, iconClassName)}
        spinnerClassName={clsx(model.spinnerClassName, spinnerClassName)}
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
          types.evalMenuItemFlag("isLocked", itemIsLocked, model) ||
          !isReady ||
          _isLocked ||
          model.isLocked
        }
        isLoading={
          types.evalMenuItemFlag("isLoading", itemIsLoading, model) || _isLoading || model.isLoading
        }
        isSelected={isSelected}
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

    if (href) {
      if (typeof href === "string") {
        return <Link href={href}>{Item}</Link>;
      }
      return (
        <Link href={href.url} rel={href.rel} target={href.target}>
          {Item}
        </Link>
      );
    }
    return Item;
  },
) as {
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    props: types.MenuItemModelRendererProps<M, O> & {
      readonly ref: ForwardedRef<types.MenuItemInstance>;
    },
  ): JSX.Element;
};
