import { type ModelValue, modelHasParam, type MenuModel } from "./model";
import { type MenuOptions } from "./options";

export type MenuInitialValue<M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isMulti: true;
}
  ? ModelValue<M, O>[]
  : ModelValue<M, O> | null;

export type MenuValue<M extends MenuModel, O extends MenuOptions<M>> = O extends { isMulti: true }
  ? ModelValue<M, O>[]
  : O extends { isNullable: true }
    ? ModelValue<M, O> | null
    : ModelValue<M, O>;

export const valueIsMulti = <
  V extends MenuInitialModelValue<M, O> | MenuModelValue<M, O>,
  M extends MenuModel,
  O extends MenuOptions<M>,
>(
  value: V,
): value is V & ModelValue<M, O>[] => Array.isArray(value);

export const valueIsNotMulti = <
  V extends MenuInitialModelValue<M, O> | MenuModelValue<M, O>,
  M extends MenuModel,
  O extends MenuOptions<M>,
>(
  value: V,
): value is V & ModelValue<M, O> => !Array.isArray(value) && value !== null;

export type MenuInitialModelValue<M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isMulti: true;
}
  ? M[]
  : M | null;

export type MenuModelValue<M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isMulti: true;
}
  ? M[]
  : O extends { isNullable: true }
    ? M | null
    : M;

export type MenuIsValued<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly value: infer V;
}
  ? V extends null | undefined
    ? never
    : true
  : O extends { readonly getItemValue: (m: M) => infer V }
    ? V extends null | undefined
      ? never
      : true
    : false;

export type IfMenuValued<
  T,
  M extends MenuModel,
  O extends MenuOptions<M>,
  F = never,
> = MenuIsValued<M, O> extends true ? T : F;

export const menuIsValued = <M extends MenuModel, O extends MenuOptions<M>>(
  data: M[],
  options: O,
): MenuIsValued<M, O> =>
  (data.some(m => modelHasParam(m, "value")) || options.getItemValue !== undefined) as MenuIsValued<
    M,
    O
  >;

export type MenuInstance<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly value: MenuValue<M, O>;
};
