"use client";
import dynamic from "next/dynamic";
import React, {
  forwardRef,
  type ForwardedRef,
  type ReactNode,
  useRef,
  useCallback,
  useState,
  useMemo,
  useImperativeHandle,
} from "react";

import * as types from "~/components//input/select/types";
import { Loading } from "~/components/loading/Loading";
import {
  type MenuItemInstance,
  type MenuItemSelectionIndicator,
  type MenuItemRenderProps,
  type DataMenuGroupProps,
  type DataMenuItemFlagProps,
  type MenuFeedbackProps,
  type MenuItemClickEvent,
  type DataMenuCustomModel,
} from "~/components/menus";
import {
  type DataMenuComponent,
  type DataMenuProps,
  pickDataMenuProps,
  omitDataMenuProps,
} from "~/components/menus/DataMenu";
import { type ComponentProps, classNames } from "~/components/types";

import {
  DataSelectBase,
  type DataSelectBaseInstance,
  type DataSelectBaseProps,
} from "./DataSelectBase";

const DataMenu = dynamic(() => import("~/components/menus/DataMenu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as DataMenuComponent;

export interface DataSelectProps<
  M extends types.ClicklessDataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<DataSelectBaseProps<M, O, types.DataSelectInstance<M, O>>, "content">,
    Pick<
      DataMenuProps<M>,
      | keyof DataMenuGroupProps<M>
      | Exclude<keyof DataMenuItemFlagProps<M>, "itemIsSelected">
      | keyof MenuFeedbackProps
      | "header"
      | "footer"
      | "enableKeyboardInteractions"
      | "selectionIndicator"
      | "getItemIcon"
      | "includeDescriptions"
      | "boldSubstrings"
      | Exclude<`item${string}` & keyof DataMenuProps<M>, "itemIsSelected">
    > {
  readonly isLoading?: boolean;
  readonly contentIsLoading?: boolean;
  readonly boldOptionsOnSearch?: boolean;
  readonly menuClassName?: ComponentProps["className"];
  readonly bottomItems?: (types.DataSelectCustomMenuItem<M, O> | JSX.Element)[];
  readonly valueRenderer?: types.DataSelectValueRenderer<M, O>;
  readonly itemRenderer?: (
    model: types.DataSelectModel<M, O>,
    params: MenuItemRenderProps,
  ) => ReactNode;
  readonly onItemClick?: (
    e: MenuItemClickEvent,
    m: M,
    instance: MenuItemInstance,
    select: types.DataSelectInstance<M, O>,
  ) => void;
}

export const DataSelect = forwardRef(
  <M extends types.ClicklessDataSelectModel, O extends types.DataSelectOptions<M>>(
    {
      menuClassName,
      selectionIndicator: _selectionIndicator,
      data,
      isDisabled,
      isLocked,
      isLoading: _propIsLoading,
      contentIsLoading: _propContentIsLoading,
      inputIsLoading,
      boldOptionsOnSearch,
      search,
      valueRenderer,
      onItemClick,
      itemRenderer,
      onSearch,
      children,
      ...props
    }: DataSelectProps<M, O>,
    ref: ForwardedRef<types.DataSelectInstance<M, O>>,
  ): JSX.Element => {
    const [_contentIsLoading, setContentIsLoading] = useState(false);
    const [_isLoading, setIsLoading] = useState(false);

    const contentIsLoading = _propContentIsLoading || _contentIsLoading;
    const isLoading = _propIsLoading || _isLoading;

    const innerRef = useRef<DataSelectBaseInstance<M, O> | null>(null);

    const select = useMemo(
      (): types.DataSelectInstance<M, O> => ({
        isSelected: m => innerRef.current?.isSelected(m) ?? false,
        isModelSelected: m => innerRef.current?.isModelSelected(m) ?? false,
        selectModel: m => innerRef.current?.selectModel(m),
        toggleModel: m => innerRef.current?.toggleModel(m),
        select: v => innerRef.current?.select(v),
        toggle: v => innerRef.current?.toggle(v),
        setValue: v => innerRef.current?.setValue(v),
        focusInput: () => innerRef.current?.focusInput(),
        setOpen: (v: boolean) => innerRef.current?.setOpen(v),
        setInputLoading: (v: boolean) => innerRef.current?.setInputLoading(v),
        setPopoverLoading: (v: boolean) => innerRef.current?.setPopoverLoading(v),
        setContentLoading: (v: boolean) => setContentIsLoading(v),
        setLoading: (v: boolean) => setIsLoading(v),
        clear: types.ifDataSelectClearable<() => void, M, O>(
          () => innerRef.current?.clear(),
          props.options,
        ),
        deselect: types.ifDataSelectDeselectable<
          (v: types.InferredDataSelectV<M, O>) => void,
          M,
          O
        >((v: types.InferredDataSelectV<M, O>) => innerRef.current?.deselect(v), props.options),
        deselectModel: types.ifDataSelectDeselectable<(m: M) => void, M, O>(
          (m: M) => innerRef.current?.deselectModel(m),
          props.options,
        ),
        __private__clear__: types.ifDataSelectClearable<() => void, M, O>(
          () => innerRef.current?.__private__clear__(),
          props.options,
        ),
        __private__deselect__: types.ifDataSelectDeselectable<
          (v: types.InferredDataSelectV<M, O>, item?: MenuItemInstance) => void,
          M,
          O
        >((v, item) => innerRef.current?.__private__deselect__(v, item), props.options),
        __private__select__: (v, item) => innerRef.current?.__private__select__(v, item),
        __private__select__model__: (m, item) =>
          innerRef.current?.__private__select__model__(m, item),
        __private__deselect__model__: types.ifDataSelectDeselectable<
          (m: M, item?: MenuItemInstance) => void,
          M,
          O
        >((m, item) => innerRef.current?.__private__deselect__model__(m, item), props.options),
        __private__toggle__: (v, item) => innerRef.current?.__private__toggle__(v, item),
        __private__toggle__model__: (m, item) =>
          innerRef.current?.__private__toggle__model__(m, item),
      }),
      [props.options],
    );

    useImperativeHandle(ref, () => select);

    const getItemValue = useCallback(
      (m: M) => {
        if (props.options.getItemValue !== undefined) {
          return props.options.getItemValue(m);
        } else if ("value" in m && m.value !== undefined) {
          return m.value;
        }
        throw new Error(
          "If the 'getItemValue' callback prop is not provided, each model must be attributed " +
            "with a defined 'value' property!",
        );
      },
      [props.options],
    );

    const defaultSelectionIndicator =
      props.options.behavior === "multi"
        ? (["checkbox", "highlight"] as MenuItemSelectionIndicator)
        : (["highlight"] as MenuItemSelectionIndicator);

    const selectionIndicator = _selectionIndicator ?? defaultSelectionIndicator;
    return (
      <DataSelectBase<M, O>
        ref={innerRef}
        {...omitDataMenuProps(props)}
        valueRenderer={valueRenderer ? (v, mv) => valueRenderer?.(v, mv, select) : undefined}
        search={search}
        isDisabled={isDisabled}
        isLocked={isLocked}
        inputIsLoading={inputIsLoading || isLoading}
        data={data}
        onSearch={onSearch}
        content={(_, { isOpen, __private__toggle__, isSelected }) =>
          // Force dynamic rendering of the DataMenu with the conditional render.
          isOpen ? (
            <DataMenu<M>
              {...pickDataMenuProps(props)}
              boldSubstrings={boldOptionsOnSearch ? search : undefined}
              isDisabled={isDisabled}
              isLocked={isLocked}
              isLoading={isLoading || contentIsLoading}
              bottomItems={props.bottomItems?.map(item =>
                types.dataSelectCustomItemIsObject(item)
                  ? ({
                      ...item,
                      renderer: item.renderer
                        ? (...args) => item.renderer?.(...args, select)
                        : undefined,
                    } as DataMenuCustomModel)
                  : item,
              )}
              data={data.map(m => ({
                ...m,
                onClick:
                  m.onClick && innerRef.current
                    ? (e: MenuItemClickEvent, instance: MenuItemInstance) =>
                        m.onClick?.(e, instance, select)
                    : undefined,
              }))}
              selectionIndicator={selectionIndicator}
              className={classNames("h-full rounded-sm", menuClassName)}
              itemIsSelected={m => {
                const fn = getItemValue as (
                  m: Omit<M, "onClick">,
                ) => types.InferredDataSelectV<M, O>;
                return isSelected(fn(m));
              }}
              onItemClick={(e, m: M, instance) => {
                const fn = getItemValue as (
                  m: Omit<M, "onClick">,
                ) => types.InferredDataSelectV<M, O>;
                __private__toggle__(fn(m), instance);
                onItemClick?.(e, m, instance, select);
              }}
              onKeyboardNavigationExit={() => {
                innerRef.current?.focusInput();
              }}
            >
              {itemRenderer ? (m, params) => itemRenderer(m, params) : undefined}
            </DataMenu>
          ) : (
            <></>
          )
        }
      >
        {children}
      </DataSelectBase>
    );
  },
) as {
  <M extends types.ClicklessDataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectProps<M, O> & { readonly ref?: ForwardedRef<types.DataSelectInstance<M, O>> },
  ): JSX.Element;
};
