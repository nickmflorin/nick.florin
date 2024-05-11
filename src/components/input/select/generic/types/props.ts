import { type ReactNode } from "react";

import { type Optional } from "utility-types";

import type {
  SelectModeledValue,
  SelectValue,
  SelectDataModel,
  SelectModel,
  SelectValueModel,
  AllowedSelectModelValue,
  SelectData,
} from "./model";

import { type PopoverProps } from "~/components/floating/Popover";
import { type PopoverRenderProps } from "~/components/floating/types";
import { type InputProps } from "~/components/input/generic";
import { type MenuProps, type MenuItemInstance } from "~/components/menus";
import { type ComponentProps } from "~/components/types";

import { type SelectOptions } from "./options";

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRendererParams<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = {
  models: SelectModeledValue<V, M, O>;
};

export type SelectValueRenderer<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = (v: SelectValue<V, O>, params: SelectValueRendererParams<V, M, O>) => ReactNode;

export type SelectValueModelRenderer<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = (v: SelectDataModel<V, M, O>) => ReactNode;

export type SelectItemRenderer<V extends AllowedSelectModelValue, M extends SelectModel<V>> = (
  model: M,
) => ReactNode;

export interface MultiValueRendererProps<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> {
  readonly models: SelectDataModel<V, M, O>[];
  readonly maximumValuesToRender?: number;
  readonly dynamicHeight?: boolean;
  readonly options: O;
  readonly valueModelRenderer?: SelectValueModelRenderer<V, M, O>;
}

export type MultiValueRendererCompoennt = {
  <V extends AllowedSelectModelValue, M extends SelectModel<V>, O extends SelectOptions<V, M>>(
    props: MultiValueRendererProps<V, M, O>,
  ): JSX.Element;
};

export type SelectChangeParams<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = {
  item: MenuItemInstance;
  models: SelectModeledValue<V, M, O>;
};

export type SelectChangeHandler<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = (value: SelectValue<V, O>, params: SelectChangeParams<V, M, O>) => void;

export interface SelectPopoverProps
  extends Pick<PopoverProps, "inPortal" | "content" | "maxHeight"> {
  readonly menuPlacement?: PopoverProps["placement"];
  readonly menuOffset?: PopoverProps["offset"];
  readonly menuWidth?: PopoverProps["width"];
  readonly isLoading?: boolean;
  readonly isReady?: boolean;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: { select: SelectInstance },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: { select: SelectInstance },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: { select: SelectInstance },
  ) => void;
  readonly children: (
    params: PopoverRenderProps & { readonly isOpen: boolean; readonly isLoading: boolean },
  ) => JSX.Element;
}

export interface BaseSelectInputProps
  extends Pick<
    InputProps,
    | "isLocked"
    | "isLoading"
    | "size"
    | "isDisabled"
    | "actions"
    | "className"
    | "withCaret"
    | "caretIsOpen"
    | "dynamicHeight"
  > {
  readonly isOpen: boolean;
  readonly children?: ReactNode;
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
}

export interface SelectInputProps<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> extends Omit<BaseSelectInputProps, "showPlaceholder" | "children"> {
  readonly isReady?: boolean;
  readonly options: O;
  readonly maximumValuesToRender?: number;
  readonly models: SelectDataModel<V, M, O>[];
  readonly value: SelectValue<V, O>;
  readonly valueRenderer?: () => ReactNode;
  readonly valueModelRenderer?: SelectValueModelRenderer<V, M, O>;
}

export type SelectArg<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends { isValueModeled?: boolean },
> = O extends { isValueModeled: true } ? SelectValueModel<V> : M;

export interface SelectBaseProps<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> extends Optional<
      Omit<
        SelectPopoverProps,
        "content" | "onOpen" | "onClose" | "onOpenChange" | keyof ComponentProps
      >,
      "children"
    >,
    Omit<
      SelectInputProps<V, M, O>,
      keyof ComponentProps | "value" | "select" | "models" | "isOpen" | "valueRenderer"
    > {
  readonly value?: SelectValue<V, O>;
  readonly initialValue?: SelectValue<V, O>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data?: SelectData<V, M, O>;
  readonly valueRenderer?: SelectValueRenderer<V, M, O>;
  readonly onChange?: SelectChangeHandler<V, M, O>;
  readonly content: (params: {
    readonly value: SelectValue<V, O>;
    readonly isSelected: (v: SelectArg<V, M, O>) => boolean;
    readonly onSelect: (v: SelectArg<V, M, O>, instance: MenuItemInstance) => void;
  }) => JSX.Element;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<V, O>;
      select: SelectInstance;
    },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<V, O>;
      select: SelectInstance;
    },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: {
      value: SelectValue<V, O>;
      select: SelectInstance;
    },
  ) => void;
}

export interface SelectProps<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> extends Omit<SelectBaseProps<V, M, O>, "content" | "data">,
    Omit<MenuProps<M, O>, "children" | "itemIsSelected" | keyof ComponentProps> {
  readonly itemRenderer?: SelectItemRenderer<V, M>;
}
