"use client";
import dynamic from "next/dynamic";
import React, {
  forwardRef,
  type ForwardedRef,
  type ReactNode,
  useRef,
  useCallback,
  useState,
  useImperativeHandle,
} from "react";

import type * as types from "~/components//input/select/types";
import { Loading } from "~/components/loading/Loading";
import {
  type MenuItemSelectionIndicator,
  type MenuItemRenderProps,
  type DataMenuGroupProps,
  type DataMenuItemCharacteristicsProps,
  type MenuFeedbackProps,
} from "~/components/menus";
import {
  type DataMenuComponent,
  type DataMenuProps,
  pickDataMenuProps,
  omitDataMenuProps,
} from "~/components/menus/DataMenu";
import { type ComponentProps, classNames } from "~/components/types";

import { DataSelectBase, type DataSelectBaseProps } from "./DataSelectBase";

const DataMenu = dynamic(() => import("~/components/menus/DataMenu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as DataMenuComponent;

export interface DataSelectProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<DataSelectBaseProps<M, O>, "content">,
    Pick<
      DataMenuProps<M>,
      | keyof DataMenuGroupProps<M>
      | Exclude<keyof DataMenuItemCharacteristicsProps<M>, "itemIsSelected">
      | keyof MenuFeedbackProps
      | "header"
      | "footer"
      | "enableKeyboardInteractions"
      | "selectionIndicator"
      | "getItemIcon"
      | "onItemClick"
      | "includeDescriptions"
      | "boldSubstrings"
      | Exclude<`item${string}` & keyof DataMenuProps<M>, "itemIsSelected">
    > {
  readonly isLoading?: boolean;
  readonly contentIsLoading?: boolean;
  readonly boldOptionsOnSearch?: boolean;
  readonly menuClassName?: ComponentProps["className"];
  readonly itemRenderer?: (model: M, params: MenuItemRenderProps) => ReactNode;
}

export const DataSelect = forwardRef(
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
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

    const innerRef = useRef<Omit<
      types.DataSelectInstance<M, O>,
      "setContentLoading" | "setLoading"
    > | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => innerRef.current?.clear(),
      setValue: v => innerRef.current?.setValue(v),
      focusInput: () => innerRef.current?.focusInput(),
      setOpen: (v: boolean) => innerRef.current?.setOpen(v),
      setInputLoading: (v: boolean) => innerRef.current?.setInputLoading(v),
      setPopoverLoading: (v: boolean) => innerRef.current?.setPopoverLoading(v),
      setContentLoading: (v: boolean) => setContentIsLoading(v),
      setLoading: (v: boolean) => setIsLoading(v),
    }));

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
        search={search}
        isDisabled={isDisabled}
        isLocked={isLocked}
        inputIsLoading={inputIsLoading || isLoading}
        data={data}
        onSearch={onSearch}
        content={(_, { isOpen, toggle, isSelected }) =>
          // Force dynamic rendering of the DataMenu with the conditional render.
          isOpen ? (
            <DataMenu<M>
              {...pickDataMenuProps(props)}
              boldSubstrings={boldOptionsOnSearch ? search : undefined}
              isDisabled={isDisabled}
              isLocked={isLocked}
              isLoading={isLoading || contentIsLoading}
              data={data}
              selectionIndicator={selectionIndicator}
              className={classNames("h-full rounded-sm", menuClassName)}
              itemIsSelected={m => {
                const fn = getItemValue as (m: M) => types.InferredDataSelectV<M, O>;
                return isSelected(fn(m));
              }}
              onItemClick={(e, m: M, instance) => {
                const fn = getItemValue as (m: M) => types.InferredDataSelectV<M, O>;
                toggle(fn(m), instance);
                onItemClick?.(e, m, instance);
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
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectProps<M, O> & { readonly ref?: ForwardedRef<types.DataSelectInstance<M, O>> },
  ): JSX.Element;
};
