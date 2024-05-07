import { type ReactNode, type ForwardedRef } from "react";

import { type IconSize } from "~/components/icons";
import { type ComponentProps } from "~/components/types";
import { type QuantitativeSize } from "~/components/types/sizes";

import { type MenuItemFlagProps } from "./flags";
import { type MenuItemInstance, type MenuItemSelectionIndicator } from "./item";
import { type MenuModel, type ModelId } from "./model";
import { type MenuOptions } from "./options";

type ItemClassName<M extends MenuModel> =
  | ComponentProps["className"]
  | ((datum: M) => ComponentProps["className"]);

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
  readonly id: ModelId<M, O> | undefined;
  readonly model: M;
  readonly options: O;
  readonly itemHeight?: QuantitativeSize<"px">;
  readonly iconSize?: IconSize;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly itemDisabledClassName?: ItemClassName<M>;
  readonly itemLoadingClassName?: ItemClassName<M>;
  readonly itemLockedClassName?: ItemClassName<M>;
  readonly itemSelectedClassName?: ItemClassName<M>;
  readonly itemClassName?: ItemClassName<M>;
  readonly selectionIndicator?: MenuItemSelectionIndicator;
  readonly onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  readonly children?: (datum: M) => ReactNode;
}

export type MenuItemClickHandler<M extends MenuModel> = (
  model: M,
  instance: MenuItemInstance,
) => void;

export type MenuContentProps<M extends MenuModel, O extends MenuOptions<M>> = ComponentProps &
  Omit<MenuItemModelRendererProps<M, O>, "model" | "onClick" | "id"> & {
    readonly data: M[];
    readonly header?: JSX.Element;
    readonly footer?: JSX.Element;
    readonly search?: string;
    readonly isLocked?: boolean;
    readonly onSearch?: (value: string) => void;
    readonly onItemClick?: MenuItemClickHandler<M>;
  };

export type MenuContainerProps = ComponentProps & {
  readonly children: JSX.Element | JSX.Element[];
};

export type MenuContentComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(props: MenuContentProps<M, O>): JSX.Element;
};

export type MenuProps<M extends MenuModel, O extends MenuOptions<M>> = MenuContentProps<M, O>;

export type MenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
