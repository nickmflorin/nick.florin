"use client";
import { useRef, createRef, type RefObject } from "react";

import clsx from "clsx";

import * as types from "../types";

import { MenuItemModelRenderer } from "./MenuItemModelRenderer";

type MenuItemRefs = { [key in types.MenuItemKey]: RefObject<types.MenuItemInstance> };

export const MenuContent = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  className,
  style,
  data,
  isLocked,
  children,
  onItemClick,
  ...props
}: types.MenuContentProps<M, O>): JSX.Element => {
  const menuItemRefs = useRef<MenuItemRefs>({});

  return (
    <div style={style} className={clsx("menu__content", className)}>
      {data.map((model, index) => {
        const id = types.getModelId(model, props.options);
        const key: types.MenuItemKey = types.getMenuItemKey({ id, index });

        let ref: RefObject<types.MenuItemInstance>;
        if (menuItemRefs.current[key] === undefined) {
          ref = createRef<types.MenuItemInstance>();
          menuItemRefs.current[key] = ref;
        } else {
          ref = menuItemRefs.current[key];
        }
        return (
          <MenuItemModelRenderer<M, O>
            {...props}
            itemIsLocked={m => Boolean(isLocked || props.itemIsLocked?.(m))}
            ref={ref}
            id={id}
            model={model}
            key={key}
            onClick={() => onItemClick?.(model, ref.current as types.MenuItemInstance)}
          >
            {children}
          </MenuItemModelRenderer>
        );
      })}
    </div>
  );
};

export default MenuContent;
