import { type ReactNode } from "react";

import { type Optional } from "utility-types";

import type {
  SelectModeledValue,
  SelectValue,
  SelectDataModel,
  SelectModel,
  UnsafeSelectValue,
  SelectModelValue,
  UnsafeSelectValueForm,
  ValueNotSet,
} from "./model";

import { type PopoverProps } from "~/components/floating/Popover";
import { type PopoverRenderProps } from "~/components/floating/types";
import { type InputProps } from "~/components/input/generic";
import { type MenuDataProps, type MenuItemInstance } from "~/components/menus";
import { type ComponentProps } from "~/components/types";

import { type SelectOptions } from "./options";

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRendererParams<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = {
  models: SelectModeledValue<V, M, O>;
};

export type SelectValueRenderer<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = (v: SelectValue<V, M, O>, params: SelectValueRendererParams<V, M, O>) => ReactNode;

export type SelectValueModelRenderer<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = (v: SelectDataModel<V, M, O>) => ReactNode;

export type SelectItemRenderer<M extends SelectModel> = (model: M) => ReactNode;

export interface MultiValueRendererProps<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> {
  readonly models: SelectDataModel<V, M, O>[];
  readonly maximumValuesToRender?: number;
  readonly dynamicHeight?: boolean;
  readonly options: O;
  readonly valueModelRenderer?: SelectValueModelRenderer<V, M, O>;
}

export type MultiValueRendererCompoenent = {
  <V extends UnsafeSelectValueForm<M, O>, M extends SelectModel, O extends SelectOptions<M>>(
    props: MultiValueRendererProps<V, M, O>,
  ): JSX.Element;
};

export type SelectChangeParams<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = O extends { isClearable: true }
  ? {
      // The item will be undefined when the change occurred due to a clear event.
      item?: MenuItemInstance;
      models: SelectModeledValue<V, M, O>;
    }
  : {
      item: MenuItemInstance;
      models: SelectModeledValue<V, M, O>;
    };

export type SelectChangeHandler<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = (value: SelectValue<V, M, O>, params: SelectChangeParams<V, M, O>) => void;

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
    | "onClear"
    | "clearDisabled"
  > {
  readonly isOpen: boolean;
  readonly children?: ReactNode;
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
}

export interface SelectInputProps<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> extends Omit<BaseSelectInputProps, "showPlaceholder" | "children"> {
  readonly isReady?: boolean;
  readonly options: O;
  readonly maximumValuesToRender?: number;
  readonly models: SelectDataModel<V, M, O>[];
  readonly valueRenderer?: () => ReactNode;
  readonly valueModelRenderer?: SelectValueModelRenderer<V, M, O>;
}

export type SelectArg<M extends SelectModel, O extends SelectOptions<M>> =
  | SelectModelValue<M, O>
  | M;

export interface SelectBaseProps<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> extends Optional<
      Omit<
        SelectPopoverProps,
        "content" | "onOpen" | "onClose" | "onOpenChange" | keyof ComponentProps
      >,
      "children"
    >,
    Omit<
      SelectInputProps<V, M, O>,
      | keyof ComponentProps
      | "value"
      | "select"
      | "models"
      | "isOpen"
      | "valueRenderer"
      | "onClear"
      | "clearDisabled"
    > {
  readonly value?: UnsafeSelectValue<V, M, O>;
  readonly initialValue?: UnsafeSelectValue<V, M, O>;
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly data: M[];
  readonly valueRenderer?: SelectValueRenderer<V, M, O>;
  readonly onChange?: SelectChangeHandler<V, M, O>;
  readonly content: (params: {
    readonly value: SelectValue<V, M, O> | ValueNotSet;
    readonly isSelected: (v: SelectArg<M, O>) => boolean;
    readonly onSelect: (v: SelectArg<M, O>, instance: MenuItemInstance) => void;
  }) => JSX.Element;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<V, M, O> | ValueNotSet;
      select: SelectInstance;
    },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: {
      value: SelectValue<V, M, O> | ValueNotSet;
      select: SelectInstance;
    },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: {
      value: SelectValue<V, M, O> | ValueNotSet;
      select: SelectInstance;
    },
  ) => void;
}

export interface SelectProps<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> extends Omit<SelectBaseProps<V, M, O>, "content" | "data">,
    Omit<MenuDataProps<M, O>, "children" | "itemIsSelected" | keyof ComponentProps> {
  readonly itemRenderer?: SelectItemRenderer<M>;
}
