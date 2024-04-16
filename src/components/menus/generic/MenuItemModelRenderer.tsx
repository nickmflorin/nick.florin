import Link from "next/link";
import { forwardRef, type ForwardedRef, useState, useImperativeHandle, useMemo } from "react";

import clsx from "clsx";
import isEqual from "lodash.isequal";

import { UnreachableCaseError } from "~/application/errors";
import { useDrawers } from "~/components/drawers/hooks";
import { useMutableParams } from "~/hooks";

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
    const { set } = useMutableParams();
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

    const query = useMemo(() => types.getModelQuery(model, options), [model, options]);

    const actions = useMemo(() => types.getModelActions(model, options), [model, options]);

    const Item = (
      <MenuItem
        id={id}
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
          onClick();
          model.onClick?.(e, { setDisabled, setLoading, setLocked });
          if (query) {
            const drawerParsed = types.DrawerQuerySchema.safeParse(query);
            if (drawerParsed.success) {
              return open(drawerParsed.data.drawerId, drawerParsed.data.props);
            }
            const queryParsed = types.QuerySchema.safeParse(query);
            if (queryParsed.success) {
              return set(queryParsed.data.params, { clear: queryParsed.data.clear ?? [] });
            }
            throw new UnreachableCaseError();
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
