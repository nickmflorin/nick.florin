import { type ReactNode, type ForwardedRef } from "react";

import { type IconSize } from "~/components/icons";
import { type ComponentProps, type QuantitativeSize } from "~/components/types";

import { type MenuItemFlagProps } from "./flags";
import { type MenuItemInstance } from "./item";
import { type MenuValue, type MenuInitialValue, type IfMenuValued } from "./menu";
import { type MenuModel, type ModelValue, type ValueNotApplicable, type ModelId } from "./model";
import { type MenuOptions } from "./options";

export interface MenuItemModelRendererProps<M extends MenuModel, O extends MenuOptions<M>>
  extends MenuItemFlagProps<M> {
  /**
   * Indicates whether or not the Menu's data has been successfully loaded in the case that it
   * is being loaded asynchronously.  If the Menu's data is loaded asynchronously, it is
   * important that this prop be used to indicate whether or not the data is present and any
   * potential value on the Menu can be correlated to a model in the asynchronously loaded
   * data.
   *
   * If this prop is not used when the Menu's data is loaded asynchronously, errors may surface
   * due to timing inconsistencies between the time at which the Menu's data is loaded from an
   * API request and when the Menu is assigned a value.  If the value is assigned before the
   * data is loaded, an errort will surface indicating that the value does not have a
   * corresponding model in the data.
   *
   * Default: true
   */
  readonly isReady?: boolean;
  readonly id: ModelId<M, O> | undefined;
  readonly model: M;
  readonly options: O;
  readonly itemHeight?: QuantitativeSize<"px">;
  readonly value: ModelValue<M, O> | ValueNotApplicable;
  readonly menuValue: ModelValue<M, O>[] | ModelValue<M, O> | null | ValueNotApplicable;
  readonly iconSize?: IconSize;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly itemDisabledClassName?:
    | ComponentProps["className"]
    | ((datum: M) => ComponentProps["className"]);
  readonly itemLoadingClassName?:
    | ComponentProps["className"]
    | ((datum: M) => ComponentProps["className"]);
  readonly itemLockedClassName?:
    | ComponentProps["className"]
    | ((datum: M) => ComponentProps["className"]);
  readonly itemSelectedClassName?: IfMenuValued<
    ComponentProps["className"] | ((datum: M) => ComponentProps["className"]),
    M,
    O
  >;
  readonly itemClassName?:
    | ComponentProps["className"]
    | ((datum: M) => ComponentProps["className"]);
  readonly onClick: () => void;
  readonly children?: (datum: M) => ReactNode;
}

export type ValuedMenuItemClickHandler<M extends MenuModel, O extends MenuOptions<M>> = (
  v: ModelValue<M, O>,
  model: M,
  instance: MenuItemInstance,
) => void;

export type MenuItemClickHandler<M extends MenuModel> = (
  model: M,
  instance: MenuItemInstance,
) => void;

export type AbstractMenuContentProps<
  M extends MenuModel,
  O extends MenuOptions<M>,
> = ComponentProps &
  Omit<
    MenuItemModelRendererProps<M, O>,
    "value" | "model" | "onClick" | "value" | "menuValue" | "id"
  > & {
    readonly data: M[];
    readonly value: MenuValue<M, O> | MenuInitialValue<M, O> | ValueNotApplicable;
    readonly onSelect?: (v: ModelValue<M, O>, model: M, instance: MenuItemInstance) => void;
    readonly onItemClick?: IfMenuValued<
      ValuedMenuItemClickHandler<M, O>,
      M,
      O,
      MenuItemClickHandler<M>
    >;
  };

export type MenuContainerProps = ComponentProps & {
  readonly children: JSX.Element | JSX.Element[];
};

export type AbstractMenuProps<M extends MenuModel, O extends MenuOptions<M>> = ComponentProps &
  AbstractMenuContentProps<M, O> & {
    readonly header?: JSX.Element;
    readonly footer?: JSX.Element;
    readonly onSelect?: ValuedMenuItemClickHandler<M, O>;
  };

export type AbstractMenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: AbstractMenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};

export type MenuContentProps<M extends MenuModel, O extends MenuOptions<M>> = ComponentProps &
  Omit<AbstractMenuContentProps<M, O>, "value" | "onSelect"> & {
    readonly value?: IfMenuValued<MenuValue<M, O>, M, O>;
    readonly initialValue?: IfMenuValued<MenuInitialValue<M, O>, M, O>;
    readonly onChange?: IfMenuValued<
      (value: MenuValue<M, O>, item: MenuItemInstance) => void,
      M,
      O
    >;
  };

export type MenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  MenuContentProps<M, O>,
  "onSelect"
>;

export type MenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
