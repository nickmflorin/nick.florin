import { type ReactNode } from "react";

import { type ComponentProps } from "~/components/types";

import { type MenuItemFlagProps } from "./flags";
import { type MenuItemInstance, type MenuModel, type MenuValue } from "./model";
import { type MenuOptions } from "./options";

type NonNullableProps<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly initialValue: MenuValue<M, O>;
};

type IsNullableProps<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly initialValue?: MenuValue<M, O>;
};

type NullableProps<T, M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isNullable: false;
  isMulti?: false;
}
  ? T & NonNullableProps<M, O>
  : T & IsNullableProps<M, O>;

export type MenuProps<M extends MenuModel, O extends MenuOptions<M>> = NullableProps<
  ComponentProps &
    MenuItemFlagProps<M> & {
      readonly options: O;
      readonly header?: JSX.Element;
      readonly footer?: JSX.Element;
      readonly value?: MenuValue<M, O>;
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
      readonly itemSelectedClassName?:
        | ComponentProps["className"]
        | ((datum: M) => ComponentProps["className"]);
      readonly itemClassName?:
        | ComponentProps["className"]
        | ((datum: M) => ComponentProps["className"]);
      readonly onChange?: (value: MenuValue<M, O>, item: MenuItemInstance) => void;
      readonly children?: (datum: M) => ReactNode;
    },
  M,
  O
>;
