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
import { useDataSelect } from "~/components/input/select/hooks";
import { type MultiValueRendererProps } from "~/components/input/select/MultiValueRenderer";
import * as types from "~/components/input/select/types";
import { type ComponentProps } from "~/components/types";
import { ifRefConnected } from "~/components/types";

import { DataSelectInput } from "./DataSelectInput";
import { RootSelect, type RootSelectProps } from "./RootSelect";
import { type RootSelectInputInstance } from "./RootSelectInput";

export interface DataSelectBaseProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
  I extends types.DataSelectBaseInstance<M, O> = types.DataSelectBaseInstance<M, O>,
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
  readonly value?: types.SelectValue<{ model: M; options: O }>;
  readonly strictValueLookup?: boolean;
  readonly initialValue?: types.SelectValue<{ model: M; options: O }>;
  readonly popoverClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: types.ConnectedDataSelectModel<M, O>[];
  readonly isClearable?: types.IfClearable<{ options: O; model: M }, boolean>;
  readonly chipsCanDeselect?: types.IfDeselectable<{ model: M; options: O }, boolean>;
  readonly showIconsInChips?: boolean;
  readonly onClear?: types.IfClearable<{ model: M; options: O }, () => void>;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly valueRenderer?: (
    value: types.SelectValue<{ model: M; options: O }>,
    modelValue: types.DataSelectModelValue<M, O>,
    select: I,
  ) => ReactNode;
  readonly getModelValueLabel?: (m: M) => ReactNode;
  readonly onChange?: types.SelectChangeHandler<{ model: M; options: O }, { modelValue: true }>;
  readonly content?: (
    value: types.SelectNullableValue<{ model: M; options: O }>,
    select: I & Pick<FloatingContentRenderProps, "isOpen" | "setIsOpen">,
  ) => JSX.Element;
}

const LocalDataSelectBase = forwardRef(
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
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
      getModelValueLabel,
      children,
      content,
      onChange,
      onOpen,
      onClose,
      onOpenChange,
      getBadgeIcon,
      ...props
    }: DataSelectBaseProps<M, O>,
    ref: ForwardedRef<types.DataSelectBaseInstance<M, O>>,
  ): JSX.Element => {
    const selectRef = useRef<types.RootSelectInstance | null>(null);
    const inputRef = useRef<RootSelectInputInstance | null>(null);

    const { value, clear, ...managed } = useDataSelect<M, O>({
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
      (): types.DataSelectBaseInstance<M, O> => ({
        ...managed,
        clear,
        focusInput: () => ifRefConnected(inputRef, i => i.focus()),
        setOpen: (v: boolean) => ifRefConnected(selectRef, s => s.setOpen(v)),
        setInputLoading: (v: boolean) => ifRefConnected(inputRef, i => i.setLoading(v)),
        setPopoverLoading: (v: boolean) =>
          ifRefConnected(selectRef, s => s.setPopoverLoading(v), {
            methodName: "setPopoverLoading",
          }),
      }),
      [managed, clear],
    );

    useImperativeHandle(ref, () => selectInstance);

    const defaultChipsCanDeselect =
      options.behavior === types.SelectBehaviorTypes.MULTI ? true : false;
    const chipsCanDeselect = _chipsCanDeselect ?? defaultChipsCanDeselect;

    const onClear = useMemo(() => {
      if ((_onClear || isClearable) && value !== types.NOTSET) {
        return () => {
          _onClear?.();
          clear({ dispatchChangeEvent: true });
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
            } as types.DataSelectBaseInstance<M, O> &
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
              getItemLabel={getModelValueLabel}
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
              onClear={types.ifClearable(onClear, { options })}
              modelValue={managed.modelValue}
              className={inputClassName}
              onBadgeClose={
                chipsCanDeselect
                  ? (m: M) => {
                      managed.deselect(m, { dispatchChangeEvent: true });
                    }
                  : undefined
              }
            />
          ))}
      </RootSelect>
    );
  },
);

export const DataSelectBase = LocalDataSelectBase as {
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectBaseProps<M, O> & {
      readonly ref?: ForwardedRef<types.DataSelectBaseInstance<M, O>>;
    },
  ): JSX.Element;
};
