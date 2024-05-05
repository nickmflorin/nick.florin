"use client";
import dynamic from "next/dynamic";
import React, { forwardRef, type ForwardedRef } from "react";

import type * as types from "../types";

import { Loading } from "~/components/feedback/Loading";
import {
  VALUE_NOT_APPLICABLE,
  type AbstractMenuProps,
  type MenuModelValue,
  type AbstractMenuComponent,
} from "~/components/menus";
import { type ComponentProps } from "~/components/types";

import { SelectBase, type SelectBaseProps } from "./SelectBase";

const AbstractMenu = dynamic(() => import("~/components/menus/generic/AbstractMenu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as AbstractMenuComponent;

type InheritedMenuProps<M extends types.SelectModel, O extends types.SelectOptions<M>> = Omit<
  AbstractMenuProps<M, O>,
  "value" | "children" | keyof ComponentProps
>;

export interface SelectProps<
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
  D extends types.SelectDataOptions<M, O>,
> extends Omit<SelectBaseProps<M, O, D>, "content">,
    InheritedMenuProps<M, O> {
  readonly dataOptions: D;
  readonly itemRenderer?: types.SelectItemRenderer<M>;
}

const LocalSelect = forwardRef<
  types.SelectInstance,
  SelectProps<
    types.SelectModel,
    types.SelectOptions<types.SelectModel>,
    types.SelectDataOptions<types.SelectModel, types.SelectOptions<types.SelectModel>>
  >
>(
  <
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
    D extends types.SelectDataOptions<M, O>,
  >(
    {
      children,
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
      isLocked,
      isLoading,
      size,
      value,
      inPortal,
      isDisabled,
      menuClassName,
      inputClassName,
      actions,
      placeholder,
      maximumNumBadges,
      maxHeight = 240,
      initialValue,
      isReady = true,
      closeMenuOnSelect,
      onChange,
      valueRenderer,
      itemRenderer,
      valueModelRenderer,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectProps<M, O, D>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => (
    <SelectBase<M, O, D>
      ref={ref}
      initialValue={initialValue}
      value={value}
      maxHeight={maxHeight}
      isReady={isReady}
      isLoading={isLoading}
      menuPlacement={menuPlacement}
      menuWidth={menuWidth}
      inPortal={inPortal}
      menuOffset={menuOffset}
      isLocked={isLocked}
      isDisabled={isDisabled}
      menuClassName={menuClassName}
      inputClassName={inputClassName}
      maximumNumBadges={maximumNumBadges}
      size={size}
      actions={actions}
      placeholder={placeholder}
      data={props.data}
      options={props.options}
      closeMenuOnSelect={closeMenuOnSelect}
      valueRenderer={valueRenderer}
      onOpen={onOpen}
      onChange={onChange}
      onClose={onClose}
      valueModelRenderer={valueModelRenderer}
      onOpenChange={onOpenChange}
      content={({ selectModel, value: _value }) => (
        <AbstractMenu
          {...(props as InheritedMenuProps<M, O>)}
          isReady={isReady}
          className="z-50"
          value={_value}
          onItemClick={(model, v, instance) => {
            if (v !== VALUE_NOT_APPLICABLE) {
              selectModel?.(v as SelectModelValue<M, O, D>, instance);
            }
            props.onItemClick?.(model, v, instance);
          }}
        >
          {itemRenderer ? m => itemRenderer(m) : undefined}
        </AbstractMenu>
      )}
    >
      {children}
    </SelectBase>
  ),
);

export const Select = LocalSelect as {
  <
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
    D extends types.SelectDataOptions<M, O>,
  >(
    props: SelectProps<M, O, D> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
