"use client";
import dynamic from "next/dynamic";
import React, { forwardRef, type ForwardedRef } from "react";

import type * as types from "./types";

import { Loading } from "~/components/feedback/Loading";
import { type MenuComponent, type MenuProps } from "~/components/menus";

import { SelectBase } from "./SelectBase";

const Menu = dynamic(() => import("~/components/menus/generic/Menu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as MenuComponent;

const LocalSelect = forwardRef<
  types.SelectInstance,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  types.SelectProps<any, types.SelectModel<any>, types.SelectOptions<any, types.SelectModel<any>>>
  /* eslint-enable @typescript-eslint/no-explicit-any */
>(
  <
    V extends types.AllowedSelectModelValue,
    M extends types.SelectModel<V>,
    O extends types.SelectOptions<V, M>,
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
      /* When the Select is value modeled, the data is not used by the SelectBase because it does
         not need to correlate the models in the data with the value.  The data is only used to
         render the MenuItem(s) in the Menu. */
      data={(props.options.isValueModeled ? undefined : props.data) as types.SelectData<V, M, O>}
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
          {...(props as MenuProps<M, O>)}
          isLocked={!isReady}
          className="z-50"
          itemIsSelected={m => isSelected(m as types.SelectArg<V, M, O>)}
          onItemClick={(model, instance) => {
            onSelect(model as types.SelectArg<V, M, O>, instance);
            props.onItemClick?.(model, instance);
          }}
        >
          {itemRenderer ? m => itemRenderer(m) : undefined}
        </Menu>
      )}
    >
      {children}
    </SelectBase>
  ),
);

export const Select = LocalSelect as {
  <
    V extends types.AllowedSelectModelValue,
    M extends types.SelectModel<V>,
    O extends types.SelectOptions<V, M>,
  >(
    props: types.SelectProps<V, M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
