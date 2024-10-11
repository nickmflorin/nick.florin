"use client";
import dynamic from "next/dynamic";
import React, {
  forwardRef,
  type ForwardedRef,
  type ReactNode,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
} from "react";

import { logger } from "~/internal/logger";

import * as types from "~/components//input/select/types";
import { useDataSelectOptions } from "~/components/input/select/hooks/use-data-select-options";
import { useSelectData } from "~/components/input/select/hooks/use-select-data";
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
  type DataMenuInstance,
  pickDataMenuProps,
  omitDataMenuProps,
  type ConnectedMenuItemInstance,
} from "~/components/menus";
import { type DataMenuProps } from "~/components/menus/DataMenu";
import { ifRefConnected } from "~/components/types";
import { type ComponentProps, classNames } from "~/components/types";

import { DataSelectBase, type DataSelectBaseProps } from "./DataSelectBase";

type DynamicDataMenuProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> = Omit<DataMenuProps<M, types.DataSelectMenuOptions<M, O>>, "ref"> & {
  readonly forwardedRef: ForwardedRef<DataMenuInstance<M, types.DataSelectMenuOptions<M, O>>>;
};

const DataMenu = dynamic(
  async () => {
    const { DataMenu } = await import("~/components/menus/DataMenu");
    return <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>({
      forwardedRef,
      ...props
    }: DynamicDataMenuProps<M, O>) => (
      <DataMenu<M, types.DataSelectMenuOptions<M, O>> ref={forwardedRef} {...props} />
    );
  },
  { loading: () => <Loading isLoading={true} spinnerSize="16px" /> },
) as {
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DynamicDataMenuProps<M, O>,
  ): JSX.Element;
};

export interface DataSelectProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<DataSelectBaseProps<M, O, types.DataSelectInstance<M, O>>, "content" | "onChange">,
    Pick<
      DataMenuProps<M, types.DataSelectMenuOptions<M, O>>,
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
      | Exclude<
          `item${string}` & keyof DataMenuProps<M, types.DataSelectMenuOptions<M, O>>,
          "itemIsSelected"
        >
    > {
  readonly isLoading?: boolean;
  readonly contentIsLoading?: boolean;
  readonly boldOptionsOnSearch?: boolean;
  readonly menuClassName?: ComponentProps["className"];
  readonly bottomItems?: (types.DataSelectCustomMenuItem<M, O> | JSX.Element)[];
  readonly valueRenderer?: types.DataSelectValueRenderer<M, O>;
  readonly itemRenderer?: (
    model: types.ConnectedDataSelectModel<M, O>,
    params: MenuItemRenderProps,
  ) => ReactNode;
  readonly onChange?: types.DataSelectChangeHandler<M, O>;
  readonly onItemClick?: (
    e: MenuItemClickEvent,
    m: M,
    instance: MenuItemInstance,
    select: types.DataSelectInstance<M, O>,
  ) => void;
}

export const DataSelect = forwardRef(
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    {
      menuClassName,
      selectionIndicator: _selectionIndicator,
      data: _data,
      isDisabled,
      isLocked,
      isLoading: _propIsLoading,
      contentIsLoading: _propContentIsLoading,
      inputIsLoading,
      boldOptionsOnSearch,
      search,
      options,
      valueRenderer,
      onItemClick,
      itemRenderer,
      onSearch,
      children,
      ...props
    }: DataSelectProps<M, O>,
    ref: ForwardedRef<types.DataSelectInstance<M, O>>,
  ): JSX.Element => {
    const menu = useRef<DataMenuInstance<M, types.DataSelectMenuOptions<M, O>> | null>(null);
    const base = useRef<types.DataSelectBaseInstance<M, O> | null>(null);

    const [_contentIsLoading, setContentIsLoading] = useState(false);
    const [_isLoading, setIsLoading] = useState(false);

    const contentIsLoading = _propContentIsLoading || _contentIsLoading;
    const isLoading = _propIsLoading || _isLoading;

    const { getItemValue } = useDataSelectOptions<M, O>({ options });
    const { data, addOptimisticModel } = useSelectData<M, O>({
      data: _data,
      base: base.current,
    });

    const select = useMemo(
      (): types.DataSelectInstance<M, O> => ({
        addOptimisticModel,
        createMenuItemInstanceIfNecessary: (...args) =>
          ifRefConnected(menu, m => m.createInstanceIfNecessary(...args), {
            strict: true,
            methodName: "createMenuItemInstanceIfNecessary",
          }),
        createMenuItemInstance: (...args) =>
          ifRefConnected(menu, m => m.createInstance(...args), {
            strict: true,
            methodName: "createMenuItemInstance",
          }),
        getOrCreateMenuItemInstance: (...args) =>
          ifRefConnected(menu, m => m.getOrCreateInstance(...args), {
            strict: true,
            methodName: "getOrCreateMenuItemInstance",
          }),
        getMenuItemInstance: (...args) =>
          ifRefConnected(menu, m => m.getInstance(...args), {
            strict: true,
            methodName: "getMenuItemInstance",
          }),
        isSelected: (...args) =>
          ifRefConnected(base, b => b.isSelected(...args), {
            defaultValue: false,
            name: "data-select-base",
            methodName: "isSelected",
          }),
        select: (...args) =>
          ifRefConnected(base, b => b.select(...args), {
            name: "data-select-base",
            methodName: "select",
          }),
        toggle: (...args) =>
          ifRefConnected(base, b => b.toggle(...args), {
            name: "data-select-base",
            methodName: "toggle",
          }),
        setValue: (...args) =>
          ifRefConnected(base, b => b.setValue(...args), {
            name: "data-select-base",
            methodName: "setValue",
          }),
        focusInput: (...args) =>
          ifRefConnected(base, b => b.focusInput(...args), {
            name: "data-select-base",
            methodName: "focusInput",
          }),
        setOpen: (...args) =>
          ifRefConnected(base, b => b.setOpen(...args), {
            name: "data-select-base",
            methodName: "setOpen",
          }),
        setInputLoading: (...args) =>
          ifRefConnected(base, b => b.setInputLoading(...args), {
            name: "data-select-base",
            methodName: "setInputLoading",
          }),
        setPopoverLoading: (...args) =>
          ifRefConnected(base, b => b.setPopoverLoading(...args), {
            name: "data-select-base",
            methodName: "setPopoverLoading",
          }),
        setContentLoading: (v: boolean) => setContentIsLoading(v),
        setLoading: (v: boolean) => setIsLoading(v),
        clear: types.ifDataSelectClearable<
          (
            p: types.SelectEventPublicArgs,
            cb?: types.DataSelectEventChangeHandler<typeof types.SelectEvents.CLEAR, M, O>,
          ) => void,
          M,
          O
        >(
          (p, cb) =>
            ifRefConnected(base, b => b.clear(p, cb), {
              methodName: "clear",
              name: "data-select-base",
            }),
          options,
        ),
        deselect: types.ifDataSelectDeselectable<
          (
            v: M | types.InferredDataSelectValue<M, O>,
            p: types.SelectEventPublicArgs,
            cb?: types.DataSelectEventChangeHandler<typeof types.SelectEvents.DESELECT, M, O>,
          ) => void,
          M,
          O
        >(
          (v, p, cb) =>
            ifRefConnected(base, b => b.deselect(v, p, cb), {
              methodName: "deselect",
              name: "data-select-base",
            }),
          options,
        ),
      }),
      [options, addOptimisticModel],
    );

    useImperativeHandle(ref, () => select);

    const defaultSelectionIndicator =
      options.behavior === "multi"
        ? (["checkbox", "highlight"] as MenuItemSelectionIndicator)
        : (["highlight"] as MenuItemSelectionIndicator);

    const selectionIndicator = _selectionIndicator ?? defaultSelectionIndicator;

    return (
      <DataSelectBase<M, O>
        ref={base}
        {...omitDataMenuProps(props)}
        options={options}
        valueRenderer={valueRenderer ? (v, mv) => valueRenderer?.(v, mv, select) : undefined}
        search={search}
        isDisabled={isDisabled}
        isLocked={isLocked}
        inputIsLoading={inputIsLoading || isLoading}
        data={data}
        onSearch={onSearch}
        onChange={(v, mv, params) => {
          if (menu.current) {
            if (params.event === types.SelectEvents.SELECT) {
              const vi = params.selected;
              const item = menu.current.getInstance(vi);
              if (!item) {
                logger.warn("FOOBAR");
              } else {
                props.onChange?.(v, mv, { ...params, item });
              }
            } else if (params.event === types.SelectEvents.DESELECT) {
              const vi = params.deselected;
              const item = menu.current.getInstance(vi);
              if (!item) {
                logger.warn("FOOBAR");
              } else {
                props.onChange?.(v, mv, { ...params, item });
              }
            } else {
              props.onChange?.(v, mv, { event: types.SelectEvents.CLEAR });
            }
          }
        }}
        content={(_, { isOpen, toggle, isSelected }) =>
          // Force dynamic rendering of the DataMenu with the conditional render.
          isOpen ? (
            <DataMenu<M, O>
              {...pickDataMenuProps(props)}
              options={{ getModelId: getItemValue }}
              forwardedRef={menu}
              boldSubstrings={boldOptionsOnSearch ? search : undefined}
              isDisabled={isDisabled}
              isLocked={isLocked}
              isLoading={isLoading || contentIsLoading}
              bottomItems={props.bottomItems?.map(item =>
                types.dataSelectCustomItemIsObject(item)
                  ? ({
                      ...item,
                      onClick: item.onClick
                        ? (...args) => item.onClick?.(...args, select)
                        : undefined,
                      renderer: item.renderer
                        ? (...args) => item.renderer?.(...args, select)
                        : undefined,
                    } as DataMenuCustomModel)
                  : item,
              )}
              data={data.map(m => ({
                ...m,
                onClick:
                  m.onClick && base.current
                    ? (e: MenuItemClickEvent, instance: ConnectedMenuItemInstance) =>
                        m.onClick?.(e, instance, select)
                    : undefined,
              }))}
              selectionIndicator={selectionIndicator}
              className={classNames("h-full rounded-sm", menuClassName)}
              itemIsSelected={m => isSelected(m)}
              onItemClick={(e, m: M, instance) => {
                // toggle(m, instance);
                toggle(m, { dispatchChangeEvent: true });
                onItemClick?.(e, m, instance, select);
              }}
              onKeyboardNavigationExit={() => {
                base.current?.focusInput();
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
