"use client";
import React from "react";
import { useRef, forwardRef, type ForwardedRef } from "react";

import { type Optional } from "utility-types";

import type * as types from "../types";

import {
  type MenuModel,
  type MenuOptions,
  type MenuValue,
  type MenuModelValue,
  type MenuItemInstance,
  type MenuInitialValue,
  type MenuInitialModelValue,
} from "~/components/menus";
import { useMenuValue } from "~/components/menus/hooks";
import { type ComponentProps } from "~/components/types";

import { FloatingSelectContent, type FloatingSelectContentProps } from "./FloatingSelectContent";
import { MenuSelectInput, type MenuSelectInputProps } from "./MenuSelectInput";
import { SelectWrapper, type SelectWrapperProps } from "./SelectWrapper";

export interface SelectProps<M extends MenuModel, O extends MenuOptions<M>>
  extends Omit<FloatingSelectContentProps<M, O>, "onSelect" | "value" | "className">,
    Optional<
      Omit<SelectWrapperProps, "content" | "onOpen" | "onClose" | "onOpenChange">,
      "children"
    >,
    Omit<MenuSelectInputProps<M, O>, "value" | "select" | "models" | "isOpen"> {
  readonly value?: MenuValue<M, O>;
  readonly initialValue?: MenuInitialValue<M, O>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly onChange?: (
    /* Here, the models and value are guaranteed to not be MenuInitialValue and
       MenuInitialModelValue anymore, because a selection was made. */
    v: MenuValue<M, O>,
    params: {
      models: MenuModelValue<M, O>;
      item: MenuItemInstance;
    },
  ) => void;
  readonly onOpen?: (
    e: Event,
    params: {
      value: MenuValue<M, O> | MenuInitialValue<M, O>;
      models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
      select: types.SelectInstance;
    },
  ) => void;
  readonly onClose?: (
    e: Event,
    params: {
      value: MenuValue<M, O> | MenuInitialValue<M, O>;
      models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
      select: types.SelectInstance;
    },
  ) => void;
  readonly onOpenChange?: (
    e: Event,
    isOpen: boolean,
    params: {
      value: MenuValue<M, O> | MenuInitialValue<M, O>;
      models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
      select: types.SelectInstance;
    },
  ) => void;
}

const LocalSelect = forwardRef<
  types.SelectInstance,
  SelectProps<MenuModel, MenuOptions<MenuModel>>
>(
  <M extends MenuModel, O extends MenuOptions<M>>(
    {
      children,
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
      isLocked,
      isLoading,
      size,
      inPortal,
      isDisabled,
      menuClassName,
      inputClassName,
      actions,
      placeholder,
      maximumNumBadges,
      initialValue,
      value: _propValue,
      isReady = true,
      closeMenuOnSelect,
      onChange,
      valueRenderer,
      valueModelRenderer,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectProps<M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const [value, models, selectModel] = useMenuValue<true, M, O>({
      initialValue: initialValue,
      isValued: true,
      value: _propValue,
      options: props.options,
      data: props.data,
      isReady,
      onChange,
    });

    return (
      <SelectWrapper
        ref={instance => {
          if (instance) {
            internalInstance.current = instance;
            if (typeof ref === "function") {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
          }
        }}
        isReady={isReady}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        menuWidth={menuWidth}
        inPortal={inPortal}
        menuOffset={menuOffset}
        onOpen={(e, { select }) => onOpen?.(e, { value, models, select })}
        onClose={(e, { select }) => onClose?.(e, { value, models, select })}
        onOpenChange={(e, isOpen, { select }) =>
          onOpenChange?.(e, isOpen, { value, models, select })
        }
        content={
          <FloatingSelectContent
            {...props}
            isReady={isReady}
            onSelect={(value, model, item) => {
              selectModel(value, item);
              if (
                closeMenuOnSelect ||
                (closeMenuOnSelect === undefined && !props.options.isMulti)
              ) {
                internalInstance.current?.setOpen(false);
              }
            }}
            value={value}
            className={menuClassName}
          />
        }
      >
        {children ??
          (({ ref, params, isOpen, isLoading }) => (
            <MenuSelectInput
              {...params}
              valueModelRenderer={valueModelRenderer}
              valueRenderer={valueRenderer}
              ref={ref}
              options={props.options}
              models={models}
              actions={actions}
              maximumNumBadges={maximumNumBadges}
              placeholder={placeholder}
              value={value}
              isOpen={isOpen}
              isLoading={isLoading}
              isLocked={isLocked}
              isReady={isReady}
              size={size}
              isDisabled={isDisabled}
              className={inputClassName}
            />
          ))}
      </SelectWrapper>
    );
  },
);

export const Select = LocalSelect as {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: SelectProps<M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
