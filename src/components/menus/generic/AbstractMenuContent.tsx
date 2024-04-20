import { useRef, createRef, type RefObject } from "react";

import clsx from "clsx";

import * as types from "../types";
import { type MenuItemKey, getMenuItemKey } from "../util";

import { MenuItemModelRenderer } from "./MenuItemModelRenderer";

type MenuItemRefs = { [key in MenuItemKey]: RefObject<types.MenuItemInstance> };

export const AbstractMenuContent = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  className,
  style,
  data,
  value,
  children,
  onItemClick,
  ...props
}: types.AbstractMenuContentProps<M, O>): JSX.Element => {
  const menuItemRefs = useRef<MenuItemRefs>({});

  return (
    <div style={style} className={clsx("menu__content", className)}>
      {data.map((model, index) => {
        const id = types.getModelId(model, props.options);
        const v: types.ModelValue<M, O> | types.ValueNotApplicable =
          value !== types.VALUE_NOT_APPLICABLE
            ? types.getModelValue(model, props.options)
            : types.VALUE_NOT_APPLICABLE;
        const key: MenuItemKey = getMenuItemKey({ value: v, id, index });

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
            ref={ref}
            id={id}
            model={model}
            value={v}
            menuValue={value}
            key={key}
            onClick={() =>
              onItemClick?.(
                model,
                v as types.IfMenuValued<types.ModelValue<M, O>, M, O, types.ValueNotApplicable>,
                ref.current as types.MenuItemInstance,
              )
            }
          >
            {children}
          </MenuItemModelRenderer>
        );
      })}
    </div>
  );
};

export default AbstractMenuContent;
