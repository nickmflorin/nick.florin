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
  onSelect,
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
            onClick={() => {
              if (v !== types.VALUE_NOT_APPLICABLE) {
                if (onSelect === undefined) {
                  throw new Error(
                    "Unexpectedly encountered undefined 'onSelect' callback for a Menu with " +
                      "an applicable value.",
                  );
                }
                onSelect?.(v, model, ref.current as types.MenuItemInstance);
                const fn = onItemClick as types.ValuedMenuItemClickHandler<M, O> | undefined;
                return fn?.(v, model, ref.current as types.MenuItemInstance);
              }
              const fn = onItemClick as types.MenuItemClickHandler<M> | undefined;
              return fn?.(model, ref.current as types.MenuItemInstance);
            }}
          >
            {children}
          </MenuItemModelRenderer>
        );
      })}
    </div>
  );
};

export default AbstractMenuContent;
