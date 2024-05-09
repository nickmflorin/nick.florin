import { type ReactNode } from "react";

import { type Optional } from "utility-types";

import type { SelectModeledValue, SelectValue } from "./select";

import { type PopoverProps } from "~/components/floating/Popover";
import { type PopoverRenderProps } from "~/components/floating/types";
import { type InputProps } from "~/components/input/generic";
import {
  type MenuProps,
  type MenuModel,
  type MenuOptions,
  type MenuItemInstance,
} from "~/components/menus";
import { type ComponentProps } from "~/components/types";

import { type SelectModel, type SelectModelValue, type SelectValueModel } from "./model";
import { type SelectOptions, type IfSelectFiltered } from "./options";

export type SelectPropValue<
  M extends SelectModel,
  O extends { isFiltered?: boolean; isMulti?: boolean },
> = IfSelectFiltered<SelectValueModel<M, O>[], O, SelectValue<M, O>>;

export type SelectModels<M extends SelectModel, O extends SelectOptions<M>> = IfSelectFiltered<
  undefined,
  O,
  M[]
>;

export type AnySelectPropValue<M extends SelectModel, O extends SelectOptions<M>> =
  | SelectModelValue<M, O>[]
  | SelectValueModel<M, O>[]
  | SelectModelValue<M, O>
  | null;

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRendererParams<M extends SelectModel, O extends SelectOptions<M>> = {
  models: SelectModeledValue<M, O>;
};

export type SelectValueRenderer<
  M extends SelectModel,
  O extends SelectOptions<M>,
  P extends SelectValueRendererParams<M, O> = SelectValueRendererParams<M, O>,
> = (v: SelectValue<M, O>, params: P) => ReactNode;

// Note: This is only allowed in the case that the Menu is not filtered.
export type SelectModelValueRenderer<
  M extends SelectModel,
  O extends SelectOptions<M>,
  P extends { model: M } = { model: M; select: SelectInstance },
> = (v: SelectValue<M, O>, params: P) => ReactNode;

export type SelectItemRenderer<M extends SelectModel> = (model: M) => ReactNode;

export interface MultiValueRendererProps<
  D extends SelectValueModel<M, O> | M,
  M extends SelectModel,
  O extends SelectOptions<M>,
> {
  readonly data: D[];
  readonly maximumNumBadges?: number;
  readonly dynamicHeight?: boolean;
}

export interface MultiValueDatumRendererProps<M extends SelectModel, O extends SelectOptions<M>>
  extends MultiValueRendererProps<SelectValueModel<M, O>, M, O> {}

export interface MultiValueModelRendererProps<M extends SelectModel, O extends SelectOptions<M>>
  extends MultiValueRendererProps<M, M, O> {
  readonly options: O;
  readonly valueModelRenderer?: (model: M) => ReactNode;
}

export type MultiValueDatumRendererComponent = {
  <M extends SelectModel, O extends SelectOptions<M>>(
    props: MultiValueDatumRendererProps<M, O>,
  ): JSX.Element;
};

export type MultiValueModelRendererCompoennt = {
  <M extends SelectModel, O extends SelectOptions<M>>(
    props: MultiValueModelRendererProps<M, O>,
  ): JSX.Element;
};

export type SelectChangeParams<M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isFiltered: true;
}
  ? {
      item: MenuItemInstance;
      models?: never;
    }
  : {
      item: MenuItemInstance;
      models: SelectModeledValue<M, O>;
    };

export type SelectChangeHandler<M extends MenuModel, O extends MenuOptions<M>> = (
  value: SelectValue<M, O>,
  params: SelectChangeParams<M, O>,
) => void;

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

export interface SelectInputProps<M extends SelectModel, O extends SelectOptions<M>>
  extends Omit<BaseSelectInputProps, "showPlaceholder" | "children"> {
  readonly isReady?: boolean;
  readonly options: O;
  readonly maximumNumBadges?: number;
  readonly models: M[]; // Note: This is only allowed in the case that the Menu is not filtered.
  readonly value: SelectPropValue<M, O>;
  readonly valueRenderer?: IfSelectFiltered<never, O, SelectValueRenderer<M, O>>;
  readonly valueModelRenderer?: IfSelectFiltered<
    never,
    O,
    SelectModelValueRenderer<M, O, { model: M }>
  >;
}

export interface SelectBaseProps<M extends SelectModel, O extends SelectOptions<M>>
  extends Optional<
      Omit<
        SelectPopoverProps,
        "content" | "onOpen" | "onClose" | "onOpenChange" | keyof ComponentProps
      >,
      "children"
    >,
    Omit<SelectInputProps<M, O>, keyof ComponentProps | "value" | "select" | "models" | "isOpen"> {
  readonly value?: SelectPropValue<M, O>;
  readonly initialValue?: SelectPropValue<M, O>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: M[];
  readonly onChange?: SelectChangeHandler<M, O>;
  readonly content: (params: {
    readonly value: SelectValue<M, O>;
    readonly isSelected: (v: SelectValueModel<M, O> | SelectModelValue<M, O> | M) => boolean;
    readonly onSelect: (
      v: SelectValueModel<M, O> | SelectModelValue<M, O> | M,
      instance: MenuItemInstance,
    ) => void;
  }) => JSX.Element;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<M, O>;
      select: SelectInstance;
    },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<M, O>;
      select: SelectInstance;
    },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: {
      value: SelectValue<M, O>;
      select: SelectInstance;
    },
  ) => void;
}

export interface SelectProps<M extends SelectModel, O extends SelectOptions<M>>
  extends Omit<SelectBaseProps<M, O>, "content">,
    Omit<MenuProps<M, O>, "children" | "itemIsSelected" | keyof ComponentProps> {
  readonly itemRenderer?: SelectItemRenderer<M>;
}
