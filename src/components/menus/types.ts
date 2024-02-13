import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema, isReactNode } from "~/lib/core";
import { IconPropSchema } from "~/components/icons";
import { type IconProp } from "~/components/icons";
import { type ComponentProps } from "~/components/types";

export type MenuModel = Record<string, unknown>;

export type MenuModelParams = {
  readonly id?: string | number;
  readonly label?: ReactNode;
  readonly icon?: IconProp;
  readonly value?: unknown;
};

const MenuModelParamsSchema = z.object({
  label: ReactNodeSchema,
  icon: IconPropSchema,
  id: z.union([z.string(), z.number()]),
  value: z.any().optional(),
});

export const modelHasParam = <M extends MenuModel, N extends keyof MenuModelParams>(
  model: M,
  param: keyof MenuModelParams,
): model is M & { [key in N]: MenuModelParams[key] } => {
  const schema = MenuModelParamsSchema.pick({ [param]: true });
  return schema.safeParse(model).success;
};

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly getItemValue: (m: I) => unknown;
  readonly getItemLabel: (m: I) => ReactNode;
  readonly getItemId: (m: I) => string | number;
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;

export const modelValueIsValid = (value: unknown) => typeof value !== "undefined" && value !== null;

export type ModelValue<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly value: infer V;
}
  ? V extends null | undefined
    ? never
    : V
  : O extends { readonly getItemValue: (m: M) => infer V }
    ? V extends null | undefined
      ? never
      : V
    : never;

export const getModelValue = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValue<M, O> => {
  let v: unknown = "__NEVER__";
  if (options.getItemValue !== undefined) {
    v = options.getItemValue(model);
  } else if (modelHasParam(model, "value")) {
    v = model.value;
  }
  if (v !== "__NEVER__" && !modelValueIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid value for a menu item in the menu.`);
  }
  return v as ModelValue<M, O>;
};

export const modelIdIsValid = (value: unknown) =>
  typeof value === "string" || typeof value === "number";

export type ModelId<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly id: infer V extends string | number;
}
  ? V
  : O extends { readonly getItemValue: (m: M) => infer V extends string | number }
    ? V
    : undefined;

export const getModelId = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelId<M, O> => {
  let v: unknown = "__NEVER__";
  if (options.getItemId !== undefined) {
    v = options.getItemId(model);
  } else if (modelHasParam(model, "id")) {
    v = model.id;
  }
  if (v !== "__NEVER__" && !modelIdIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid id for a menu item in the menu.`);
  }
  return v as ModelId<M, O>;
};

export const modelLabelIsValid = (value: unknown) => isReactNode(value);

export type ModelLabel<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly label: infer L extends ReactNode;
}
  ? L
  : O extends { readonly getItemLabel: (m: M) => infer L extends ReactNode }
    ? L
    : undefined;

export const getModelLabel = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelLabel<M, O> => {
  let v: unknown = "__NEVER__";
  if (options.getItemLabel !== undefined) {
    v = options.getItemLabel(model);
  } else if (modelHasParam(model, "label")) {
    v = model.label;
  }
  if (v !== "__NEVER__" && !modelLabelIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid id for a menu item in the menu.`);
  }
  return v as ModelLabel<M, O>;
};

export type MenuValue<M extends MenuModel, O extends MenuOptions<M>> = O extends { isMulti: true }
  ? ModelValue<M, O>[]
  : O extends { isNullable: true }
    ? ModelValue<M, O> | null
    : ModelValue<M, O>;

export const valueIsMulti = <M extends MenuModel, O extends MenuOptions<M>>(
  value: MenuValue<M, O>,
): value is MenuValue<M, O> & ModelValue<M, O>[] => Array.isArray(value);

export const valueIsNotMulti = <M extends MenuModel, O extends MenuOptions<M>>(
  value: MenuValue<M, O>,
): value is MenuValue<M, O> & ModelValue<M, O> => !Array.isArray(value) && value !== null;

export type MenuModelValue<M extends MenuModel, O extends MenuOptions<M>> = O extends {
  isMulti: true;
}
  ? M[]
  : O extends { isNullable: true }
    ? M | null
    : M;

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
  ComponentProps & {
    readonly options: O;
    readonly header?: JSX.Element;
    readonly footer?: JSX.Element;
    readonly value?: MenuValue<M, O>;
    readonly data: M[];
    readonly itemSelectedClassName?:
      | ComponentProps["className"]
      | ((datum: M) => ComponentProps["className"]);
    readonly itemClassName?:
      | ComponentProps["className"]
      | ((datum: M) => ComponentProps["className"]);
    readonly onChange?: (value: MenuValue<M, O>) => void;
    readonly children?: (datum: M) => ReactNode;
  },
  M,
  O
>;

export type MenuInstance<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly value: MenuValue<M, O>;
};
