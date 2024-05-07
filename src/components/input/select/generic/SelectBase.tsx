"use client";
import React from "react";
import { useRef, forwardRef, type ForwardedRef } from "react";

import type * as types from "./types";

import { FloatingSelectContent } from "./FloatingSelectContent";
import { useSelectValue } from "./hooks/use-select-value";
import { SelectInput } from "./SelectInput";
import { SelectPopover } from "./SelectPopover";

const LocalSelectBase = forwardRef<
  types.SelectInstance,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  types.SelectBaseProps<any, types.SelectOptions<any>>
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
    }: types.SelectBaseProps<M, O>,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const { value, models, selectValue, isSelected, onSelect } = useSelectValue<M, O>({
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
        onOpen={(e, { select }) => onOpen?.(e, { value: selectValue, select })}
        onClose={(e, { select }) => onClose?.(e, { value: selectValue, select })}
        onOpenChange={(e, isOpen, { select }) =>
          onOpenChange?.(e, isOpen, { value: selectValue, select })
        }
        content={
          <FloatingSelectContent className={menuClassName}>
            {content({
              value: selectValue,
              isSelected,
              onSelect: (v, instance) => {
                const newState = onSelect(v);
                if (props.options.isFiltered) {
                  onChange?.(newState.selectValue, { item: instance } as types.SelectChangeParams<
                    M,
                    O
                  >);
                } else {
                  onChange?.(newState.selectValue, {
                    item: instance,
                    models: newState.models,
                  } as types.SelectChangeParams<M, O>);
                }
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
            <SelectInput
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
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: types.SelectBaseProps<M, O> & { readonly ref?: ForwardedRef<types.SelectInstance> },
  ): JSX.Element;
};
