"use client";
import React, { useMemo, useRef, forwardRef, type ForwardedRef, useImperativeHandle } from "react";

import { useSelectValue } from "~/components/input/select/hooks";
import * as types from "~/components/input/select/types";
import { type ComponentProps } from "~/components/types";

import { BasicSelect, type BasicSelectProps } from "./BasicSelect";
import { SelectInput } from "./SelectInput";

export interface SelectProps<V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>
  extends Omit<BasicSelectProps, "content" | "onClear" | "renderedValue" | "showPlaceholder"> {
  readonly behavior: B;
  readonly value?: types.SelectValue<V, B>;
  readonly initialValue?: types.SelectValue<V, B>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly isClearable?: boolean;
  readonly onClear?: types.IfDeselectable<B, () => void>;
  readonly valueRenderer?: types.SelectValueRenderer<V, B>;
  readonly onChange?: types.SelectChangeHandler<V, B>;
  readonly content: types.SelectManagedCallback<JSX.Element, V, B>;
}

const LocalSelect = forwardRef(
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    {
      behavior,
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      closeMenuOnSelect,
      menuWidth = "target",
      isLoading,
      inPortal,
      menuClassName,
      inputClassName,
      maxHeight,
      initialValue,
      value: _propValue,
      isReady,
      isClearable,
      onClear: _onClear,
      valueRenderer,
      children,
      content,
      onChange,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectProps<V, B>,
    ref: ForwardedRef<types.SelectInstance<V, B>>,
  ): JSX.Element => {
    const internalInstance = useRef<types.BasicSelectInstance | null>(null);

    const { value, clear, ...managed } = useSelectValue<V, B>({
      initialValue,
      __private_controlled_value__: _propValue,
      behavior,
      onChange: v => onChange?.(v),
      onSelect: () => {
        if (
          closeMenuOnSelect ||
          (closeMenuOnSelect === undefined && behavior !== types.SelectBehaviorTypes.MULTI)
        ) {
          internalInstance.current?.setOpen(false);
        }
      },
    });

    const onClear = useMemo(() => {
      if (_onClear || isClearable) {
        return () => {
          _onClear?.();
          clear();
        };
      }
      return undefined;
    }, [_onClear, isClearable, clear]);

    useImperativeHandle(ref, () => ({
      clear,
      setValue: v => managed.set(v),
      focusInput: () => internalInstance.current?.focusInput(),
      setOpen: v => internalInstance.current?.setOpen(v),
      setLoading: v => internalInstance.current?.setLoading(v),
    }));

    return (
      <BasicSelect
        ref={internalInstance}
        maxHeight={maxHeight}
        isReady={isReady}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        menuClassName={menuClassName}
        menuWidth={menuWidth}
        inPortal={inPortal}
        menuOffset={menuOffset}
        onOpen={onOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        content={content(value, { ...managed, clear })}
      >
        {children ??
          (({ ref, params, isOpen, isLoading }) => (
            <SelectInput
              {...params}
              {...props}
              value={value}
              isOpen={isOpen}
              isLoading={isLoading}
              ref={ref}
              onClear={onClear as types.IfDeselectable<B, () => void>}
              className={inputClassName}
            >
              {valueRenderer?.(value, { ...managed, clear })}
            </SelectInput>
          ))}
      </BasicSelect>
    );
  },
);

export const Select = LocalSelect as {
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    props: SelectProps<V, B> & {
      readonly ref?: ForwardedRef<types.SelectInstance<V, B>>;
    },
  ): JSX.Element;
};
