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
  types.SelectProps<types.SelectModel, types.SelectOptions<types.SelectModel>>
>(
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
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
    }: types.SelectProps<M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => (
    <SelectBase<M, O>
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
      content={({ onSelect, isSelected }) => (
        <Menu
          {...(props as MenuProps<M, O>)}
          isLocked={!isReady}
          className="z-50"
          itemIsSelected={m => isSelected(m)}
          onItemClick={(model, instance) => {
            onSelect(model, instance);
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
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: types.SelectProps<M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
