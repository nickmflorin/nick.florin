import { forwardRef, type ForwardedRef, useRef, createRef, type RefObject } from "react";

import clsx from "clsx";
import isEqual from "lodash.isequal";

import * as types from "../types";
import { type MenuItemKey, getMenuItemKey } from "../util";

import { MenuItem } from "./MenuItem";

type MenuItemRefs = { [key in MenuItemKey]: RefObject<types.MenuItemInstance> };

export const AbstractMenu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      header,
      footer,
      data,
      options,
      value,
      isReady = true,
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
      onSelect,
      ...props
    }: types.AbstractMenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
    const menuItemRefs = useRef<MenuItemRefs>({});

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
                isLocked={types.evalMenuItemFlag("isLocked", itemIsLocked, model) || !isReady}
                isLoading={types.evalMenuItemFlag("isLoading", itemIsLoading, model)}
                isSelected={
                  options.isMulti
                    ? Array.isArray(value)
                      ? value.filter(vi => isEqual(vi, v)).length > 0
                      : false
                    : isEqual(value, v)
                }
                onClick={() => {
                  onSelect(v, ref.current as types.MenuItemInstance);
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
) as types.AbstractMenuComponent;

export default AbstractMenu;