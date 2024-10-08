"use client";
import React, {
  useMemo,
  type ReactNode,
  useRef,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from "react";

import type { FloatingContentRenderProps } from "~/components/floating";
import { useSelectModelValue } from "~/components/input/select/hooks";
import { type MultiValueRendererProps } from "~/components/input/select/MultiValueRenderer";
import * as types from "~/components/input/select/types";
import { type ComponentProps } from "~/components/types";

import { DataSelectInput } from "./DataSelectInput";
import { RootSelect, type RootSelectProps } from "./RootSelect";
import { type RootSelectInputInstance } from "./RootSelectInput";

export interface DataSelectBaseInstance<
  M extends types.ClicklessDataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<types.DataSelectInstance<M, O>, "setContentLoading" | "setLoading"> {}

export interface DataSelectBaseProps<
  M extends types.ClicklessDataSelectModel,
  O extends types.DataSelectOptions<M>,
  I extends DataSelectBaseInstance<M, O> = DataSelectBaseInstance<M, O>,
> extends Omit<
      RootSelectProps,
      "content" | "onClear" | "renderedValue" | "showPlaceholder" | "inputRef"
    >,
    Pick<
      MultiValueRendererProps<M>,
      | "chipClassName"
      | "badgeProps"
      | "chipSize"
      | "onBadgeClose"
      | "getBadgeIcon"
      | "getBadgeProps"
      | "maximumValuesToRender"
      | "maximumValuesToRender"
      | "summarizeValueAfter"
      | "summarizeValue"
      | "valueSummary"
    > {
  readonly options: O;
  readonly value?: types.DataSelectValue<M, O>;
  readonly strictValueLookup?: boolean;
  readonly initialValue?: types.DataSelectValue<M, O>;
  readonly popoverClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: types.DataSelectModel<M, O>[];
  readonly isClearable?: boolean;
  readonly chipsCanDeselect?: boolean;
  readonly showIconsInChips?: boolean;
  readonly onClear?: types.IfDeselectable<O["behavior"], () => void>;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly valueRenderer?: (
    value: types.DataSelectValue<M, O>,
    modelValue: types.DataSelectModelValue<M, O>,
    select: I,
  ) => ReactNode;
  readonly getItemId?: (m: Omit<M, "onClick">) => string | number | undefined;
  readonly getItemValueLabel?: (m: M) => ReactNode;
  readonly onChange?: types.DataSelectChangeHandler<M, O>;
  readonly content?: (
    value: types.DataSelectNullableValue<M, O>,
    select: I & Pick<FloatingContentRenderProps, "isOpen" | "setIsOpen">,
  ) => JSX.Element;
}

const LocalDataSelectBase = forwardRef(
  <M extends types.ClicklessDataSelectModel, O extends types.DataSelectOptions<M>>(
    {
      options,
      closeMenuOnSelect,
      inPortal,
      popoverClassName,
      inputClassName,
      initialValue,
      value: _propValue,
      isReady,
      data,
      onClear: _onClear,
      isClearable,
      chipsCanDeselect: _chipsCanDeselect,
      showIconsInChips = true,
      strictValueLookup = true,
      inputIsLoading,
      popoverIsLoading,
      popoverPlacement,
      popoverAllowedPlacements,
      popoverAutoUpdate,
      popoverMaxHeight,
      popoverOffset,
      popoverWidth,
      getItemValueLabel,
      children,
      content,
      onChange,
      onOpen,
      onClose,
      onOpenChange,
      getBadgeIcon,
      ...props
    }: DataSelectBaseProps<M, O>,
    ref: ForwardedRef<DataSelectBaseInstance<M, O>>,
  ): JSX.Element => {
    const selectRef = useRef<types.RootSelectInstance | null>(null);
    const inputRef = useRef<RootSelectInputInstance | null>(null);

    const { value, clear, ...managed } = useSelectModelValue<M, O>({
      initialValue,
      __private_controlled_value__: _propValue,
      strictValueLookup,
      options,
      data,
      isReady,
      onChange,
      onSelect: () => {
        if (
          closeMenuOnSelect ||
          (closeMenuOnSelect === undefined && options.behavior !== types.SelectBehaviorTypes.MULTI)
        ) {
          selectRef.current?.setOpen(false);
        }
      },
    });

    const selectInstance = useMemo(
      (): DataSelectBaseInstance<M, O> => ({
        ...managed,
        clear,
        setValue: v => managed.set(v),
        deselect: types.ifDataSelectDeselectable(v => managed.deselect(v), options),
        deselectModel: types.ifDataSelectDeselectable(m => managed.deselectModel(m), options),
        focusInput: () => inputRef.current?.focus(),
        setOpen: (v: boolean) => selectRef.current?.setOpen(v),
        setInputLoading: (v: boolean) => inputRef.current?.setLoading(v),
        setPopoverLoading: (v: boolean) => selectRef.current?.setPopoverLoading(v),
      }),
      [options, managed, clear],
    );

    useImperativeHandle(ref, () => selectInstance);

    const defaultChipsCanDeselect =
      options.behavior === types.SelectBehaviorTypes.MULTI ? true : false;
    const chipsCanDeselect = _chipsCanDeselect ?? defaultChipsCanDeselect;

    const onClear = useMemo(() => {
      if ((_onClear || isClearable) && value !== types.NOTSET) {
        return () => {
          _onClear?.();
          clear();
        };
      }
      return undefined;
    }, [isClearable, value, _onClear, clear]);

    return (
      <RootSelect
        ref={selectRef}
        isReady={isReady}
        popoverIsLoading={popoverIsLoading}
        inputIsLoading={inputIsLoading}
        inPortal={inPortal}
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
        content={p => {
          if (value !== types.NOTSET && content !== undefined) {
            return content(value, {
              ...p,
              ...selectInstance,
              clear,
            } as DataSelectBaseInstance<M, O> &
              Pick<FloatingContentRenderProps, "isOpen" | "setIsOpen">);
          }
          return <></>;
        }}
      >
        {children ??
          (({ ref: _ref, params, isOpen }) => (
            <DataSelectInput<M, O>
              {...params}
              {...props}
              valueRenderer={
                props.valueRenderer
                  ? (v, mv) => props.valueRenderer?.(v, mv, selectInstance)
                  : undefined
              }
              getItemLabel={getItemValueLabel}
              getBadgeIcon={showIconsInChips ? getBadgeIcon : undefined}
              isDisabled={props.isDisabled || managed.modelValue === types.NOTSET}
              options={options}
              value={value}
              isOpen={isOpen}
              isLoading={inputIsLoading}
              ref={instance => {
                if (instance) {
                  _ref(instance);
                  if (instance) {
                    inputRef.current = instance;
                  }
                }
              }}
              onClear={onClear as types.IfDeselectable<O["behavior"], () => void>}
              modelValue={managed.modelValue}
              className={inputClassName}
              onBadgeClose={
                chipsCanDeselect ? (m: M) => managed.__private__deselect__model__(m) : undefined
              }
            />
          ))}
      </RootSelect>
    );
  },
);

export const DataSelectBase = LocalDataSelectBase as {
  <M extends types.ClicklessDataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectBaseProps<M, O> & {
      readonly ref?: ForwardedRef<DataSelectBaseInstance<M, O>>;
    },
  ): JSX.Element;
};
