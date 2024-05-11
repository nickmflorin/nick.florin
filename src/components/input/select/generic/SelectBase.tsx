"use client";
import React from "react";
import { useRef, forwardRef, type ForwardedRef } from "react";

import isEqual from "lodash.isequal";

import type * as types from "./types";

import { FloatingSelectContent } from "./FloatingSelectContent";
import { useSelectValue } from "./hooks/use-select-value";
import { SelectInput } from "./SelectInput";
import { SelectPopover } from "./SelectPopover";

const LocalSelectBase = forwardRef<
  types.SelectInstance,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  types.SelectBaseProps<any, types.SelectModel<any>, types.SelectOptions<any>>
  /* eslint-enable @typescript-eslint/no-explicit-any */
>(
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
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
    }: types.SelectBaseProps<V, M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const { value, models, modelsArray, isSelected, onSelect } = useSelectValue<V, M, O>({
      initialValue,
      value: _propValue,
      options: props.options,
      data,
      isReady,
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
        onOpen={(e, { select }) => onOpen?.(e, { value, select })}
        onClose={(e, { select }) => onClose?.(e, { value, select })}
        onOpenChange={(e, isOpen, { select }) => onOpenChange?.(e, isOpen, { value, select })}
        content={
          <FloatingSelectContent className={menuClassName}>
            {content({
              value,
              isSelected,
              onSelect: (v, instance) => {
                const newState = onSelect(v);

                if (!isEqual(newState.value, value)) {
                  onChange?.(newState.value, {
                    item: instance,
                    models: newState.models,
                  } as types.SelectChangeParams<V, M, O>);
                  if (
                    closeMenuOnSelect ||
                    (closeMenuOnSelect === undefined && !props.options.isMulti)
                  ) {
                    internalInstance.current?.setOpen(false);
                  }
                }
              },
            })}
          </FloatingSelectContent>
        }
      >
        {children ??
          (({ ref, params, isOpen, isLoading }) => (
            <SelectInput
              {...params}
              {...props}
              dynamicHeight={dynamicHeight}
              value={value}
              isOpen={isOpen}
              isLoading={isLoading}
              ref={ref}
              models={modelsArray}
              className={inputClassName}
              valueRenderer={
                props.valueRenderer ? () => props.valueRenderer?.(value, { models }) : undefined
              }
            />
          ))}
      </SelectPopover>
    );
  },
);

export const SelectBase = LocalSelectBase as {
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    props: types.SelectBaseProps<V, M, O> & {
      readonly ref?: ForwardedRef<types.SelectInstance>;
    },
  ): JSX.Element;
};
