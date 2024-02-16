"use client";
import {
  forwardRef,
  type ForwardedRef,
  type MutableRefObject,
  useRef,
  createRef,
  type RefObject,
} from "react";

import clsx from "clsx";
import isEqual from "lodash.isequal";

import * as hooks from "../hooks";
import * as types from "../types";

import { MenuItem } from "./MenuItem";

type MenuItemKey = string | number;

const getMenuItemKey = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  value,
  id,
  index,
}: {
  value: types.ModelValue<M, O>;
  index: number;
  id: types.ModelId<M, O>;
}): MenuItemKey =>
  typeof value === "string" || typeof value === "number" ? value : id !== undefined ? id : index;

type MenuItemRefs = { [key in MenuItemKey]: RefObject<types.MenuItemInstance> };

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      header,
      footer,
      data,
      options,
      initialValue,
      value: _propValue,
      itemClassName,
      itemIsDisabled,
      itemDisabledClassName,
      itemIsLoading,
      itemLoadingClassName,
      itemIsLocked,
      itemLockedClassName,
      itemSelectedClassName,
      itemIsVisible,
      children,
      onChange,
      ...props
    }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
    const menuItemRefs = useRef<MenuItemRefs>({});

    const [value, _, selectModel] = hooks.useMenuValue<M, O>({
      initialValue,
      value: _propValue,
      options,
      data,
      onChange,
    });
    return (
      <div {...props} className={clsx("menu", props.className)} ref={ref}>
        {header && <div className="menu__header">{header}</div>}
        <div className="menu__content">
          {data.map((model, i) => {
            const v = types.getModelValue(model, options);
            const id = types.getModelId(model, options);
            const label = types.getModelLabel(model, options);
            const key = getMenuItemKey({ value: v, id, index: i });

            let ref: RefObject<types.MenuItemInstance>;
            if (menuItemRefs.current[key] === undefined) {
              ref = createRef<types.MenuItemInstance>();
              menuItemRefs.current[key] = ref;
            } else {
              ref = menuItemRefs.current[key];
            }
            return (
              <MenuItem
                ref={ref}
                key={key}
                isMulti={options.isMulti}
                className={
                  typeof itemClassName === "function" ? itemClassName(model) : itemClassName
                }
                disabledClassName={itemDisabledClassName}
                selectedClassName={itemSelectedClassName}
                loadingClassName={itemLoadingClassName}
                lockedClassName={itemLockedClassName}
                isDisabled={types.evalMenuItemFlag("isDisabled", itemIsDisabled, model)}
                isVisible={types.evalMenuItemFlag("isVisible", itemIsVisible, model)}
                isLocked={types.evalMenuItemFlag("isLocked", itemIsLocked, model)}
                isLoading={types.evalMenuItemFlag("isLoading", itemIsLoading, model)}
                isSelected={
                  options.isMulti
                    ? Array.isArray(value)
                      ? value.filter(vi => isEqual(vi, v)).length > 0
                      : false
                    : isEqual(value, v)
                }
                onClick={() => {
                  selectModel(v, ref.current as types.MenuItemInstance);
                }}
              >
                {children ? children(model) : label}
              </MenuItem>
            );
          })}
        </div>
        {footer && <div className="menu__footer">{footer}</div>}
      </div>
    );
  },
) as {
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    props: types.MenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
