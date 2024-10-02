"use client";
import dynamic from "next/dynamic";
import React, { forwardRef, type ForwardedRef, type ReactNode, useRef, useCallback } from "react";

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
      | Exclude<`item${string}` & keyof DataMenuProps<M>, "itemIsSelected">
    > {
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
      isLoading,
      onItemClick,
      itemRenderer,
      children,
      ...props
    }: DataSelectProps<M, O>,
    ref: ForwardedRef<types.DataSelectInstance<M, O>>,
  ): JSX.Element => {
    const innerRef = useRef<types.DataSelectInstance<M, O> | null>(null);

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
        ref={instance => {
          innerRef.current = instance;
          if (typeof ref === "function") {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
        {...omitDataMenuProps(props)}
        isDisabled={isDisabled}
        isLocked={isLocked}
        isLoading={isLoading}
        data={data}
        content={(_, { toggle, isSelected }) => (
          <DataMenu<M>
            {...pickDataMenuProps(props)}
            isDisabled={isDisabled}
            isLocked={isLocked}
            isLoading={isLoading}
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
        )}
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
