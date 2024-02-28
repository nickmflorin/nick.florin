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
import { mergeActions } from "~/components/structural";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { Input, type InputProps } from "../../generic";

const MultiValueRenderer = dynamic(
  () => import("./MultiValueRenderer"),
) as types.MultiValueRendererCompoennt;

const Menu = dynamic(() => import("~/components/menus/generic/Menu"), {
  loading: () => <Loading loading={true} />,
}) as MenuComponent;

type SelectMenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  Required<MenuProps<M, O>, "value">,
  "children" | keyof ComponentProps | "onChange"
>;

export type SelectProps<M extends MenuModel, O extends MenuOptions<M>> = SelectMenuProps<M, O> &
  Pick<FloatingProps, "placement" | "inPortal"> &
  Pick<InputProps, "isLoading" | "isDisabled" | "isLocked" | "size" | "actions"> & {
    readonly menuClassName?: ComponentProps["className"];
    readonly children?: FloatingProps["children"];
    readonly inputClassName?: ComponentProps["className"];
    readonly placeholder?: ReactNode;
    readonly maximumNumBadges?: number;
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
    readonly itemRenderer?: types.SelectItemRenderer<M>;
    readonly valueRenderer?: types.SelectValueRenderer<M, O>;
    readonly valueModelRenderer?: types.SelectValueModelRenderer<M, O>;
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
      placeholder,
      maximumNumBadges,
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
      if (Array.isArray(models) && models.length === 0 && placeholder) {
        return <div className="placeholder">{placeholder}</div>;
      } else if (models === null && placeholder) {
        return <div className="placeholder">{placeholder}</div>;
      } else if (valueRenderer) {
        return valueRenderer(value, { models, instance: selectInstance });
      } else if (Array.isArray(models)) {
        return (
          <MultiValueRenderer
            models={models as M[]}
            selectInstance={selectInstance}
            value={value}
            options={props.options}
            maximumNumBadges={maximumNumBadges}
          />
        );
      } else if (valueModelRenderer) {
        return valueModelRenderer(value, { model: models, instance: selectInstance });
      }
      return getModelLabel(models, props.options);
    }, [
      valueRenderer,
      valueModelRenderer,
      models,
      value,
      selectInstance,
      props.options,
      placeholder,
      maximumNumBadges,
    ]);

    return (
      <Floating
        placement={placement}
        triggers={["click"]}
        width="target"
        inPortal={inPortal}
        withArrow={false}
        offset={{ mainAxis: 2 }}
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
              className={clsx("select", inputClassName)}
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
