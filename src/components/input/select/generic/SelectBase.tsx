"use client";
import React from "react";
import { useRef, forwardRef, type ForwardedRef } from "react";

import { type Optional } from "utility-types";

import type * as types from "../types";

import {
  type MenuValue,
  type MenuModelValue,
  type MenuItemInstance,
  type MenuInitialValue,
  type MenuInitialModelValue,
  type ModelValue,
} from "~/components/menus";
import { useMenuValue } from "~/components/menus/hooks";
import { type ComponentProps } from "~/components/types";

import { FloatingSelectContent } from "./FloatingSelectContent";
import { MenuSelectInput, type MenuSelectInputProps } from "./MenuSelectInput";
import { SelectFloating, type SelectFloatingProps } from "./SelectFloating";

export interface SelectBaseProps<M extends types.SelectModel, O extends types.SelectOptions<M>>
  extends Optional<
      Omit<
        SelectFloatingProps,
        "content" | "onOpen" | "onClose" | "onOpenChange" | keyof ComponentProps
      >,
      "children"
    >,
    Omit<
      MenuSelectInputProps<M, O>,
      keyof ComponentProps | "value" | "select" | "models" | "isOpen"
    > {
  readonly value?: MenuValue<M, O>;
  readonly initialValue?: MenuInitialValue<M, O>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: M[];
  readonly content: (params: {
    value: MenuInitialValue<M, O> | MenuValue<M, O>;
    isReady: boolean;
    selectModel: (v: ModelValue<M, O>, instance: MenuItemInstance) => void;
  }) => JSX.Element;
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

const LocalSelectBase = forwardRef<
  types.SelectInstance,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  SelectBaseProps<any, types.SelectOptions<any>>
>(
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    {
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      closeMenuOnSelect,
      menuWidth = "target",
      isLoading,
      inPortal,
      menuClassName,
      inputClassName,
      maxHeight = 240,
      initialValue,
      value: _propValue,
      isReady = true,
      data,
      dynamicHeight = true,
      children,
      content,
      onChange,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectBaseProps<M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const [value, models, selectModel] = useMenuValue<true, M, O>({
      initialValue: initialValue,
      isValued: true,
      value: _propValue,
      options: props.options,
      data,
      isReady,
      onChange,
    });

    return (
      <SelectFloating
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
        maxHeight={maxHeight}
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
          <FloatingSelectContent className={menuClassName}>
            {content({
              value,
              isReady,
              selectModel: (v, instance) => {
                selectModel(v, instance);
                if (
                  closeMenuOnSelect ||
                  (closeMenuOnSelect === undefined && !props.options.isMulti)
                ) {
                  internalInstance.current?.setOpen(false);
                }
              },
            })}
          </FloatingSelectContent>
        }
      >
        {children ??
          (({ ref, params, isOpen, isLoading }) => (
            <MenuSelectInput
              {...params}
              {...props}
              dynamicHeight={dynamicHeight}
              value={value}
              isOpen={isOpen}
              isLoading={isLoading}
              ref={ref}
              models={models}
              className={inputClassName}
            />
          ))}
      </SelectFloating>
    );
  },
);

export const SelectBase = LocalSelectBase as {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: SelectBaseProps<M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
