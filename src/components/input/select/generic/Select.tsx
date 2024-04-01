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

import type * as types from "../types";

import { Floating, type FloatingProps } from "~/components/floating/Floating";
import { FloatingContent } from "~/components/floating/FloatingContent";
import { CaretIcon } from "~/components/icons/CaretIcon";
import {
  type MenuModel,
  type MenuOptions,
  type MenuProps,
  type AbstractMenuProps,
  type MenuValue,
  type MenuModelValue,
  type MenuItemInstance,
  getModelLabel,
  type AbstractMenuComponent,
  type MenuInitialValue,
  type MenuInitialModelValue,
  getItemValueLabel,
} from "~/components/menus";
import { useMenuValue } from "~/components/menus/hooks";
import { mergeActions } from "~/components/structural";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { Input, type InputProps } from "../../generic";

const MultiValueRenderer = dynamic(
  () => import("./MultiValueRenderer"),
) as types.MultiValueRendererCompoennt;

const AbstractMenu = dynamic(() => import("~/components/menus/generic/AbstractMenu"), {
  loading: () => <Loading loading={true} />,
}) as AbstractMenuComponent;

type SelectMenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  AbstractMenuProps<M, O>,
  "onSelect" | "value" | "children" | keyof ComponentProps
>;

export type SelectProps<M extends MenuModel, O extends MenuOptions<M>> = SelectMenuProps<M, O> &
  Pick<FloatingProps, "inPortal"> &
  Pick<InputProps, "isLoading" | "isDisabled" | "isLocked" | "size" | "actions"> & {
    readonly value?: MenuValue<M, O>;
    readonly menuPlacement?: FloatingProps["placement"];
    readonly menuOffset?: FloatingProps["offset"];
    readonly menuWidth?: FloatingProps["width"];
    readonly initialValue?: MenuInitialValue<M, O>;
    readonly menuClassName?: ComponentProps["className"];
    readonly children?: FloatingProps["children"];
    readonly inputClassName?: ComponentProps["className"];
    readonly placeholder?: ReactNode;
    readonly maximumNumBadges?: number;
    readonly closeMenuOnSelect?: boolean;
    readonly onChange?: (
      /* Here, the models and value are guaranteed to not be MenuInitialValue and
         MenuInitialModelValue anymore, because a selection was made. */
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
        value: MenuValue<M, O> | MenuInitialValue<M, O>;
        models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
      },
    ) => void;
    readonly onClose?: (
      e: Event,
      params: {
        value: MenuValue<M, O> | MenuInitialValue<M, O>;
        models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
        instance: types.SelectInstance<M, O>;
      },
    ) => void;
    readonly onOpenChange?: (
      e: Event,
      params: {
        isOpen: boolean;
        value: MenuValue<M, O> | MenuInitialValue<M, O>;
        models: MenuModelValue<M, O> | MenuInitialModelValue<M, O>;
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
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
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
      initialValue,
      value: _propValue,
      isReady = true,
      closeMenuOnSelect,
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

    const [value, models, selectModel] = useMenuValue<true, M, O>({
      initialValue: initialValue,
      isValued: true,
      value: _propValue,
      options: props.options,
      data: props.data,
      isReady,
      onChange: (value, params) => {
        props.onChange?.(value, { ...params, instance: selectInstance });
      },
    });

    const [open, setOpen] = useState(false);

    const isLoading = _propIsLoading || _isLoading;

    const selectInstance: types.SelectInstance<M, O> = useMemo(
      () => ({
        value,
        setOpen,
        setLoading,
      }),
      [value, setOpen, setLoading],
    );

    useImperativeHandle(ref, () => selectInstance);

    const renderedValue = useMemo(() => {
      /* The models and/or value may be null regardless of whether or not the Menu is nullable.
         If the Menu is non-nullable, the value and/or models can be null on initialization,
         before any selection has occurred. */
      if (value === null || models === null || (Array.isArray(models) && models.length === 0)) {
        if (placeholder) {
          return <div className="placeholder">{placeholder}</div>;
        }
        return <></>;
      }
      /* Coercion of the models here is safe, because we already checked if the models is null. If
         the models is not null, it is safe to assume that the models is a MenuModelValue, not the
         MenuInitialModelValue. */
      const _models = models as MenuModelValue<M, O>;
      /* Coercion of the value here is safe, because we already checked if the value is null. If the
         value is not null, it is safe to assume that the value is a MenuValue, not the
         MenuInitialValue. */
      const _value = value as MenuValue<M, O>;

      if (valueRenderer) {
        return valueRenderer(_value, {
          models: _models,
          instance: selectInstance,
        });
      } else if (Array.isArray(_models)) {
        return (
          <MultiValueRenderer
            models={_models as M[]}
            selectInstance={selectInstance}
            value={_value}
            options={props.options}
            maximumNumBadges={maximumNumBadges}
          />
        );
      } else if (valueModelRenderer) {
        return valueModelRenderer(_value, { model: _models, instance: selectInstance });
      }
      const valueLabel = getItemValueLabel(_models, props.options);
      return valueLabel ?? getModelLabel(_models, props.options);
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
        placement={menuPlacement}
        triggers={["click"]}
        width={menuWidth}
        inPortal={inPortal}
        withArrow={false}
        offset={menuOffset}
        isOpen={open}
        isDisabled={!isReady}
        onOpen={e => onOpen?.(e, { value, models, instance: selectInstance })}
        onClose={e => onClose?.(e, { value, models, instance: selectInstance })}
        onOpenChange={(isOpen, evt) => {
          setOpen(isOpen);
          onOpenChange?.(evt, { isOpen, value, models, instance: selectInstance });
        }}
        content={
          <FloatingContent variant="white">
            <AbstractMenu
              {...(props as MenuProps<M, O>)}
              isReady={isReady}
              className={clsx("z-50", menuClassName)}
              value={value}
              onSelect={(value, model, item) => {
                selectModel(value, item);
                if (
                  closeMenuOnSelect ||
                  (closeMenuOnSelect === undefined && !props.options.isMulti)
                ) {
                  setOpen(false);
                }
              }}
            >
              {itemRenderer ? m => itemRenderer(m) : undefined}
            </AbstractMenu>
          </FloatingContent>
        }
      >
        {children ||
          (({ ref, params }) => (
            <Input
              {...params}
              dynamicHeight={true}
              ref={ref}
              actions={mergeActions(actions, {
                right: [<CaretIcon key="0" open={open} />],
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
