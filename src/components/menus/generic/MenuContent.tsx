"use client";
import * as hooks from "../hooks";
import * as types from "../types";

import { AbstractMenuContent } from "./AbstractMenuContent";

export const MenuContent = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  initialValue,
  value: _propValue,
  onChange,
  ...props
}: types.MenuContentProps<M, O>): JSX.Element => {
  const [value, _, selectModel] = hooks.useMenuValue<boolean, M, O>({
    initialValue,
    isValued: types.menuIsValued(props.data, props.options),
    value: _propValue,
    options: props.options,
    data: props.data,
    isReady: props.isReady,
    onChange: (value, params) => onChange?.(value, params.item),
  });
  return (
    <div className="menu__content-wrapper">
      <AbstractMenuContent
        {...props}
        value={value}
        onSelect={(v, model, instance) => selectModel?.(v, instance)}
      />
    </div>
  );
};

export default MenuContent;
