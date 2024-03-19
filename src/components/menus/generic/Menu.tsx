"use client";
import { forwardRef, type ForwardedRef } from "react";

import * as hooks from "../hooks";
import * as types from "../types";

import { AbstractMenu } from "./AbstractMenu";

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    { initialValue, value: _propValue, onChange, ...props }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
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
      <AbstractMenu
        {...props}
        ref={ref}
        value={value}
        onSelect={types.menuIsValued(props.data, props.options) ? selectModel : undefined}
      />
    );
  },
) as types.MenuComponent;

export default Menu;
