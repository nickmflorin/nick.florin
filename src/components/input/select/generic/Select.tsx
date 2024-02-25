"use client";
import dynamic from "next/dynamic";
import React from "react";
import {
  type ReactNode,
  useState,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
} from "react";

import clsx from "clsx";
import { motion } from "framer-motion";
import { type Required } from "utility-types";

import type * as types from "../types";

import { Badge } from "~/components/badges/Badge";
import { Floating, type FloatingProps } from "~/components/floating/Floating";
import { Icon } from "~/components/icons/Icon";
import {
  type MenuModel,
  type MenuOptions,
  type MenuProps,
  useMenuValue,
  type MenuValue,
  type MenuModelValue,
  type MenuItemInstance,
  getModelLabel,
  type MenuComponent,
} from "~/components/menus";
import { getMenuItemKey } from "~/components/menus/util";
import { mergeActions } from "~/components/structural";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { Input, type InputProps } from "../../generic";

const Menu = dynamic(() => import("~/components/menus/generic/Menu"), {
  loading: () => <Loading loading={true} />,
}) as MenuComponent;

type SelectMenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  Required<MenuProps<M, O>, "value">,
  "children" | keyof ComponentProps | "onChange"
>;

export type SelectValueRenderer<M extends MenuModel, O extends MenuOptions<M>> = (
  v: MenuValue<M, O>,
  params: { models: MenuModelValue<M, O>; instance: types.SelectInstance<M, O> },
) => ReactNode;

export type SelectValueModelRenderer<M extends MenuModel, O extends MenuOptions<M>> = (
  v: MenuValue<M, O>,
  params: { model: M; instance: types.SelectInstance<M, O> },
) => ReactNode;

export type SelectItemRenderer<M extends MenuModel> = (model: M) => ReactNode;

export type SelectProps<M extends MenuModel, O extends MenuOptions<M>> = SelectMenuProps<M, O> &
  Pick<FloatingProps, "placement" | "inPortal"> &
  Pick<InputProps, "isLoading" | "isDisabled" | "isLocked" | "size" | "actions"> & {
    readonly menuClassName?: ComponentProps["className"];
    readonly children?: FloatingProps["children"];
    readonly inputClassName?: ComponentProps["className"];
    readonly onChange?: (
      v: MenuValue<M, O>,
      params: {
        models: MenuModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
        item: MenuItemInstance;
      },
    ) => void;
    readonly onOpen?: (
      e: Event,
      params: {
        value: MenuValue<M, O>;
        models: MenuModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
      },
    ) => void;
    readonly onClose?: (
      e: Event,
      params: {
        value: MenuValue<M, O>;
        models: MenuModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
      },
    ) => void;
    readonly onOpenChange?: (
      e: Event,
      params: {
        isOpen: boolean;
        value: MenuValue<M, O>;
        models: MenuModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
      },
    ) => void;
    readonly itemRenderer?: SelectItemRenderer<M>;
    readonly valueRenderer?: SelectValueRenderer<M, O>;
    readonly valueModelRenderer?: SelectValueModelRenderer<M, O>;
  };

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generics don't play well with forward refs. */
const LocalSelect = forwardRef<types.SelectInstance<any, any>, SelectProps<any, any>>(
  <M extends MenuModel, O extends MenuOptions<M>>(
    {
      children,
      placement,
      isLocked,
      isLoading: _propIsLoading,
      size,
      inPortal,
      isDisabled,
      menuClassName,
      inputClassName,
      actions,
      isReady = true,
      itemRenderer,
      valueRenderer,
      valueModelRenderer,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectProps<M, O>,
    ref: ForwardedRef<types.SelectInstance<M, O>>,
  ): JSX.Element => {
    const [_isLoading, setLoading] = useState(false);
    const [value, models, _, setValue] = useMenuValue(props);
    const [open, setOpen] = useState(false);

    const isLoading = _propIsLoading || _isLoading;

    const selectInstance: types.SelectInstance<M, O> = useMemo(
      () => ({
        value,
        setOpen,
        setLoading,
        setValue,
      }),
      [value, setOpen, setLoading, setValue],
    );

    useImperativeHandle(ref, () => selectInstance);

    const renderedValue = useMemo(() => {
      if (valueRenderer) {
        return valueRenderer(value, { models, instance: selectInstance });
      } else if (Array.isArray(models)) {
        // Sort models by key for consistent ordering.
        const ms = models.sort((a, b) => (getMenuItemKey(a) > getMenuItemKey(b) ? 1 : -1));
        return (
          <div className="flex flex-wrap gap-y-[4px] gap-x-[4px] overflow-hidden">
            {ms.map((m, i) => {
              if (valueModelRenderer) {
                return (
                  <React.Fragment key={i}>
                    {valueModelRenderer(value, { model: m, instance: selectInstance })}
                  </React.Fragment>
                );
              }
              const label = getModelLabel(m, props.options);
              if (typeof label === "string") {
                return (
                  <Badge size="xxs" key={i}>
                    {label}
                  </Badge>
                );
              }
              return label;
            })}
          </div>
        );
      } else if (valueModelRenderer) {
        return valueModelRenderer(value, { model: models, instance: selectInstance });
      }
      return getModelLabel(models, props.options);
    }, [valueRenderer, valueModelRenderer, models, value, selectInstance, props.options]);

    return (
      <Floating
        placement={placement}
        triggers={["click"]}
        width="target"
        inPortal={inPortal}
        withArrow={false}
        isOpen={open}
        isDisabled={!isReady}
        variant="none"
        onOpen={e => onOpen?.(e, { value, models, instance: selectInstance })}
        onClose={e => onClose?.(e, { value, models, instance: selectInstance })}
        onOpenChange={(isOpen, evt) => {
          setOpen(isOpen);
          onOpenChange?.(evt, { isOpen, value, models, instance: selectInstance });
        }}
        content={
          <Menu
            {...(props as MenuProps<M, O>)}
            isReady={isReady}
            className={clsx("z-50", menuClassName)}
            value={value}
            onChange={(v, item) => {
              setValue(v);
              props.onChange?.(v, { models, instance: selectInstance, item });
            }}
          >
            {itemRenderer ? m => itemRenderer(m) : undefined}
          </Menu>
        }
      >
        {children ||
          (({ ref, params }) => (
            <Input
              {...params}
              dynamicHeight={true}
              ref={ref}
              actions={mergeActions(actions, {
                right: [
                  <motion.div key="0" initial={{ rotate: 0 }} animate={{ rotate: open ? 180 : 0 }}>
                    <Icon name="angle-up" size="16px" dimension="height" fit="square" />
                  </motion.div>,
                ],
              })}
              isLoading={isLoading}
              isLocked={isLocked || !isReady}
              isActive={open}
              size={size}
              isDisabled={isDisabled}
              className={clsx("select-input", inputClassName)}
            >
              <>{renderedValue}</>
            </Input>
          ))}
      </Floating>
    );
  },
);

export const Select = LocalSelect as {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: SelectProps<M, O> & { readonly ref?: ForwardedRef<types.SelectInstance<M, O>> },
  ): JSX.Element;
};
