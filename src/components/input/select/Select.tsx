"use client";
import React, {
  useMemo,
  useRef,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useState,
} from "react";

import { useSelectValue } from "~/components/input/select/hooks";
import * as types from "~/components/input/select/types";
import { type ComponentProps } from "~/components/types";

import { RootSelect, type RootSelectProps } from "./RootSelect";
import { SelectInput } from "./SelectInput";

export interface SelectProps<V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>
  extends Omit<RootSelectProps, "content" | "onClear" | "renderedValue" | "showPlaceholder"> {
  readonly behavior: B;
  readonly isLoading?: boolean;
  readonly value?: types.SelectValue<V, B>;
  readonly initialValue?: types.SelectValue<V, B>;
  readonly popoverClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly isClearable?: boolean;
  readonly onClear?: types.IfDeselectable<B, () => void>;
  readonly valueRenderer?: types.SelectValueRenderer<V, B>;
  readonly onChange?: types.SelectChangeHandler<V, B>;
  readonly content: types.SelectManagedCallback<JSX.Element, V, B, types.SelectNullableValue<V, B>>;
}

export const Select = forwardRef(
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    {
      behavior,
      popoverPlacement,
      closeMenuOnSelect,
      isLoading: _propIsLoading,
      inPortal,
      popoverClassName,
      inputClassName,
      initialValue,
      value: _propValue,
      isReady,
      isClearable,
      inputIsLoading,
      popoverAllowedPlacements,
      popoverAutoUpdate,
      popoverMaxHeight,
      popoverOffset,
      popoverIsLoading,
      popoverWidth,
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
    const [_isLoading, setIsLoading] = useState(false);
    const isLoading = _propIsLoading || _isLoading;

    const innerRef = useRef<types.RootSelectInstance | null>(null);

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
          innerRef.current?.setOpen(false);
        }
      },
    });

    useImperativeHandle(ref, () => ({
      clear,
      setValue: v => managed.set(v),
      focusInput: () => innerRef.current?.focusInput(),
      setOpen: (v: boolean) => innerRef.current?.setOpen(v),
      setInputLoading: (v: boolean) => innerRef.current?.setInputLoading(v),
      setPopoverLoading: (v: boolean) => innerRef.current?.setPopoverLoading(v),
      setLoading: (v: boolean) => setIsLoading(v),
    }));

    const onClear = useMemo(() => {
      if (_onClear || isClearable) {
        return () => {
          _onClear?.();
          clear();
        };
      }
      return undefined;
    }, [_onClear, isClearable, clear]);

    return (
      <RootSelect
        ref={innerRef}
        isReady={isReady}
        inPortal={inPortal}
        /* Do not pass 'inputIsLoading' through to RootSelect.  It will not have an effect - as we
           are overriding the input child element below. */
        popoverIsLoading={popoverIsLoading}
        popoverPlacement={popoverPlacement}
        popoverClassName={popoverClassName}
        popoverAllowedPlacements={popoverAllowedPlacements}
        popoverAutoUpdate={popoverAutoUpdate}
        popoverMaxHeight={popoverMaxHeight}
        popoverOffset={popoverOffset}
        popoverWidth={popoverWidth}
        onOpen={onOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        content={value !== types.NOTSET ? content(value, { ...managed, clear }) : <></>}
      >
        {children ??
          (({ ref, params, isOpen }) => (
            <SelectInput
              {...params}
              {...props}
              value={value}
              isOpen={isOpen}
              isLoading={inputIsLoading || isLoading}
              ref={ref}
              onClear={onClear as types.IfDeselectable<B, () => void>}
              className={inputClassName}
            >
              {value !== types.NOTSET &&
              !(behavior === types.SelectBehaviorTypes.SINGLE && value === null)
                ? // This type coercion is safe because SelectValue and SelectNullableValue are the
                  /* same when the select's behavior is not single, non-nullable and the value is
                     not null. */
                  valueRenderer?.(value as types.SelectValue<V, B>, { ...managed, clear })
                : undefined}
            </SelectInput>
          ))}
      </RootSelect>
    );
  },
) as {
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    props: SelectProps<V, B> & {
      readonly ref?: ForwardedRef<types.SelectInstance<V, B>>;
    },
  ): JSX.Element;
};
