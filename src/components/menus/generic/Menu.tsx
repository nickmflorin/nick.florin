"use client";
import { forwardRef, type ForwardedRef } from "react";

import clsx from "clsx";
import isEqual from "lodash.isequal";

import * as hooks from "../hooks";
import * as types from "../types";

import { MenuItem } from "./MenuItem";

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      header,
      footer,
      data,
      options,
      initialValue,
      value: _propValue,
      children,
      onChange,
      ...props
    }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
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
            return (
              <MenuItem
                key={typeof v === "string" || typeof v === "number" ? v : id !== undefined ? id : i}
                isMulti={options.isMulti}
                isSelected={
                  options.isMulti
                    ? Array.isArray(value)
                      ? value.filter(vi => isEqual(vi, v)).length > 0
                      : false
                    : isEqual(value, v)
                }
                onClick={() => selectModel(v)}
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
