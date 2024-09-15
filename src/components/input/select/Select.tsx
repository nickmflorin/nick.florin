"use client";
import dynamic from "next/dynamic";
import React, { forwardRef, type ForwardedRef } from "react";

import type * as types from "./types";

import { Loading } from "~/components/feedback/Loading";
import { type MenuComponent, type MenuDataProps, type MenuItemInstance } from "~/components/menus";

import { SelectBase } from "./SelectBase";

const Menu = dynamic(() => import("~/components/menus/Menu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as MenuComponent;

const LocalSelect = forwardRef<
  types.SelectInstance,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  types.SelectProps<any, types.SelectModel<any>, types.SelectOptions<any>>
  /* eslint-enable @typescript-eslint/no-explicit-any */
>(
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
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
      maximumValuesToRender,
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
    }: types.SelectProps<V, M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => (
    <SelectBase<V, M, O>
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
      maximumValuesToRender={maximumValuesToRender}
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
      content={({ onSelect, isSelected }) => (
        <Menu
          {...(props as MenuDataProps<M, O>)}
          isLocked={!isReady}
          className="z-50"
          itemIsSelected={(m: M) => isSelected(m as types.SelectArg<M, O>)}
          onItemClick={(model: M, instance: MenuItemInstance) => {
            onSelect(model as types.SelectArg<M, O>, instance);
            props.onItemClick?.(model, instance);
          }}
        >
          {itemRenderer ? (m: M) => itemRenderer(m) : undefined}
        </Menu>
      )}
    >
      {children}
    </SelectBase>
  ),
);

export const Select = LocalSelect as {
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    props: types.SelectProps<V, M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
