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
    <AbstractMenuContent
      {...props}
      value={value}
      onItemClick={(model, v, instance) => {
        if (v !== types.VALUE_NOT_APPLICABLE) {
          selectModel?.(v as types.MenuModelValue<M, O>, instance);
        }
        props.onItemClick?.(model, v, instance);
      }}
    />
  );
};

export default MenuContent;
