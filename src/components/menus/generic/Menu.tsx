"use client";
import { forwardRef, type ForwardedRef } from "react";

import type * as types from "../types";

import * as hooks from "../hooks";

import { AbstractMenu } from "./AbstractMenu";

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    { initialValue, value: _propValue, onChange, ...props }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
    const [value, _, selectModel] = hooks.useMenuValue<M, O>({
      initialValue,
      value: _propValue,
      options: props.options,
      data: props.data,
      isReady: props.isReady,
      onChange: (value, params) => onChange?.(value, params.item),
    });

    return <AbstractMenu {...props} ref={ref} value={value} onSelect={selectModel} />;
  },
) as types.MenuComponent;

export default Menu;
