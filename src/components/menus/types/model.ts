import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema, isReactNode } from "~/lib/core";
import { IconPropSchema } from "~/components/icons";

import { type MenuOptions } from "./options";

export type MenuModel = Record<string, unknown>;

const MenuModelParamsSchema = z.object({
  label: ReactNodeSchema,
  icon: IconPropSchema,
  id: z.union([z.string(), z.number()]),
  value: z.any(),
  isLocked: z.boolean(),
  isLoading: z.boolean(),
  isDisabled: z.boolean(),
  isVisible: z.boolean(),
});

export type MenuModelParams = z.infer<typeof MenuModelParamsSchema>;

export const modelHasParam = <M extends MenuModel, N extends keyof MenuModelParams>(
  model: M,
  param: keyof MenuModelParams,
): model is M & { [key in N]: MenuModelParams[key] } => {
  const schema = MenuModelParamsSchema.pick({ [param]: true });
  return schema.safeParse(model).success;
};

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

export type MenuInstance<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly value: MenuValue<M, O>;
};

export type MenuItemInstance = {
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};
