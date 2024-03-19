import { type ReactNode, type ForwardedRef } from "react";

import { type ComponentProps } from "~/components/types";

import { type MenuItemFlagProps } from "./flags";
import {
  type MenuItemInstance,
  type MenuModel,
  type MenuValue,
  type MenuInitialValue,
  type ModelValue,
  type IfMenuValued,
  type ValueNotApplicable,
} from "./model";
import { type MenuOptions } from "./options";

export type AbstractMenuProps<M extends MenuModel, O extends MenuOptions<M>> = ComponentProps &
  MenuItemFlagProps<M> & {
    readonly options: O;
    readonly header?: JSX.Element;
    readonly footer?: JSX.Element;
    readonly value: MenuValue<M, O> | MenuInitialValue<M, O> | ValueNotApplicable;
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
    readonly data: M[];
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
    readonly onSelect: ((v: ModelValue<M, O>, instance: MenuItemInstance) => void) | undefined;
    readonly children?: (datum: M) => ReactNode;
  };

export type AbstractMenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: AbstractMenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};

export type MenuProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  AbstractMenuProps<M, O>,
  "onSelect" | "value"
> & {
  readonly value?: IfMenuValued<MenuValue<M, O>, M, O>;
  readonly initialValue?: IfMenuValued<MenuInitialValue<M, O>, M, O>;
  readonly onChange?: IfMenuValued<(value: MenuValue<M, O>, item: MenuItemInstance) => void, M, O>;
};

export type MenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
