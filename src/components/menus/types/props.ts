import { type ReactNode, type ForwardedRef } from "react";

import { type Prettify } from "~/lib/types";

import { type IconSize } from "~/components/icons";
import type { ComponentProps, QuantitativeSize } from "~/components/types";

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

type _MenuContentInheritedDataProps<M extends MenuModel, O extends MenuOptions<M>> = Omit<
  MenuItemModelRendererProps<M, O>,
  "model" | "onClick" | "id"
>;

export interface MenuDataContentProps<M extends MenuModel, O extends MenuOptions<M>>
  extends ComponentProps,
    _MenuContentInheritedDataProps<M, O> {
  readonly data: M[];
  readonly isLocked?: boolean;
  readonly isBordered?: boolean;
  readonly onItemClick?: MenuItemClickHandler<M>;
}

type InheritedPropNames = keyof _MenuContentInheritedDataProps<never, never>;
type TransformedClassNameProps = Extract<InheritedPropNames, `item${string}ClassName`>;

type _MenuContentInheritedComponentProps = Prettify<
  Pick<
    _MenuContentInheritedDataProps<never, never>,
    "itemHeight" | "selectionIndicator" | "iconSize" | "spinnerClassName" | "iconClassName"
  > & {
    readonly [key in TransformedClassNameProps]?: ComponentProps["className"];
  } & {
    readonly children: (JSX.Element | null | (JSX.Element | null)[])[];
  }
>;

export interface MenuComponentContentProps
  extends ComponentProps,
    _MenuContentInheritedComponentProps {
  readonly data?: never;
  readonly isLocked?: boolean;
  readonly isBordered?: boolean;
}

export type MenuContentProps<M extends MenuModel, O extends MenuOptions<M>> =
  | MenuComponentContentProps
  | MenuDataContentProps<M, O>;

export type MenuContainerProps = ComponentProps & {
  readonly children: ReactNode;
};

export type MenuContentComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(props: MenuContentProps<M, O>): JSX.Element;
};

export interface MenuItemGroupComponentProps extends MenuComponentContentProps {
  readonly contentIsLoading?: boolean;
  readonly label: ReactNode;
  readonly labelContainerClassName?: ComponentProps["className"];
  readonly labelClassName?: ComponentProps["className"];
}

export interface MenuItemGroupDataProps<M extends MenuModel, O extends MenuOptions<M>>
  extends MenuDataContentProps<M, O> {
  readonly contentIsLoading?: boolean;
  readonly label: ReactNode;
  readonly labelContainerClassName?: ComponentProps["className"];
  readonly labelClassName?: ComponentProps["className"];
}

export type MenuItemGroupProps<M extends MenuModel, O extends MenuOptions<M>> =
  | MenuItemGroupDataProps<M, O>
  | MenuItemGroupComponentProps;

export interface MenuComponentProps extends MenuComponentContentProps {
  readonly header?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly search?: string;
  readonly contentIsLoading?: boolean;
  readonly isBordered?: boolean;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
}

export interface MenuDataProps<M extends MenuModel, O extends MenuOptions<M>>
  extends MenuDataContentProps<M, O> {
  readonly header?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly search?: string;
  readonly contentIsLoading?: boolean;
  readonly isBordered?: boolean;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
}

export type MenuProps<M extends MenuModel, O extends MenuOptions<M>> =
  | MenuDataProps<M, O>
  | MenuComponentProps;

export type MenuComponent = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MenuProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
