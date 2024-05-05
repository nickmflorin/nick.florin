"use client";
import React from "react";
import { useRef, forwardRef, type ForwardedRef } from "react";

import { type Optional } from "utility-types";

import type * as types from "../types";

import { type MenuItemInstance } from "~/components/menus";
import { useMenuValue } from "~/components/menus/hooks";
import { type ComponentProps } from "~/components/types";

import { FloatingSelectContent } from "./FloatingSelectContent";
import { MenuSelectInput, type MenuSelectInputProps } from "./MenuSelectInput";
import { SelectPopover, type SelectPopoverProps } from "./SelectPopover";

export interface SelectBaseProps<
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
  D extends types.SelectDataOptions<M, O>,
> extends Optional<
      Omit<
        SelectPopoverProps,
        "content" | "onOpen" | "onClose" | "onOpenChange" | keyof ComponentProps
      >,
      "children"
    >,
    Omit<
      MenuSelectInputProps<M, O>,
      keyof ComponentProps | "value" | "select" | "models" | "isOpen"
    > {
  readonly value?: types.SelectValue<M, O, D>;
  readonly initialValue?: types.SelectValue<M, O, D>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: M[];
  readonly content: (params: {
    value: types.SelectValue<M, O, D>;
    isReady: boolean;
    selectModel: (v: types.SelectModelValue<M, O, D>, instance: MenuItemInstance) => void;
  }) => JSX.Element;
  readonly onChange?: (
    v: types.SelectValue<M, O, D>,
    params: {
      models: types.SelectModeledValue<M, O, D>;
      item: MenuItemInstance;
    },
  ) => void;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: types.SelectValue<M, O, D>;
      models: types.SelectModeledValue<M, O, D>;
      select: types.SelectInstance;
    },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: types.SelectValue<M, O, D>;
      models: types.SelectModeledValue<M, O, D>;
      select: types.SelectInstance;
    },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: {
      value: types.SelectValue<M, O, D>;
      models: types.SelectModelValue<M, O, D>;
      select: types.SelectInstance;
    },
  ) => void;
}

const LocalSelectBase = forwardRef<
  types.SelectInstance,
  SelectBaseProps<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    types.SelectOptions<any>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    types.SelectDataOptions<any, types.SelectOptions<any>>
  >
>(
  <
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
    D extends types.SelectDataOptions<M, O>,
  >(
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
    }: SelectBaseProps<M, O, D>,
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
      <SelectPopover
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
      </SelectPopover>
    );
  },
);

export const SelectBase = LocalSelectBase as {
  <
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
    D extends types.SelectDataOptions<M, O>,
  >(
    props: SelectBaseProps<M, O, D> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
