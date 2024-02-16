import {
  type ReactNode,
  useState,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";

import clsx from "clsx";
import { type Required } from "utility-types";

import type * as types from "./types";

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
} from "~/components/menus";
import { Menu } from "~/components/menus/generic/Menu";
import { mergeActions } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { Input, type InputProps } from "../generic";

type SelectMenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  Required<MenuProps<M, O>, "value">,
  "children" | keyof ComponentProps | "onChange"
>;

export type SelectValueRenderer<M extends MenuModel, O extends MenuOptions<M>> = (
  v: MenuValue<M, O>,
  params: { models: MenuModelValue<M, O>; instance: types.SelectInstance<M, O> },
) => ReactNode;

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
    readonly valueRenderer?: SelectValueRenderer<M, O>;
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
      valueRenderer,
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

    const _valueRenderer = useCallback<SelectValueRenderer<M, O>>(
      (v, { models }) => {
        if (models === null) {
          return "";
        } else if (Array.isArray(models)) {
          return models.map(m => getModelLabel(m, props.options)).join(", ");
        }
        return getModelLabel(models, props.options);
      },
      [props.options],
    );

    const renderedValue = useMemo(() => {
      if (valueRenderer) {
        return valueRenderer(value, { models, instance: selectInstance });
      }
      return _valueRenderer(value, { models, instance: selectInstance });
    }, [_valueRenderer, valueRenderer, models, value, selectInstance]);

    return (
      <Floating
        placement={placement}
        triggers={["click"]}
        width="target"
        inPortal={inPortal}
        withArrow={false}
        isOpen={open}
        variant="none"
        onOpen={e => onOpen?.(e, { value, models, instance: selectInstance })}
        onClose={e => onClose?.(e, { value, models, instance: selectInstance })}
        onOpenChange={(isOpen, evt) => {
          setOpen(isOpen);
          onOpenChange?.(evt, { isOpen, value, models, instance: selectInstance });
        }}
        content={({ ref, params, styles }) => (
          <Menu
            {...(props as MenuProps<M, O>)}
            {...params}
            className={clsx("z-50", menuClassName)}
            ref={ref}
            style={styles}
            value={value}
            onChange={(v, item) => {
              setValue(v);
              props.onChange?.(v, { models, instance: selectInstance, item });
            }}
          />
        )}
      >
        {children ||
          (({ ref, params }) => (
            <Input
              {...params}
              ref={ref}
              actions={mergeActions(actions, {
                right: [
                  <Icon key="0" name="angle-down" size="16px" dimension="height" fit="fit" />,
                ],
              })}
              isLoading={isLoading}
              isLocked={isLocked}
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
