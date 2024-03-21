import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema, isReactNode } from "~/lib/core";
import { IconPropSchema } from "~/components/icons";

import { type ItemQueryOption, type MenuOptions } from "./options";

export type MenuModel = Record<string, unknown>;

export const VALUE_NOT_APPLICABLE = "__VALUE_NOT_APPLICABLE__";
export type ValueNotApplicable = typeof VALUE_NOT_APPLICABLE;

const QuerySchema = z.object({
  params: z.record(z.string()),
  clear: z.array(z.string()).optional(),
});

const MenuModelParamsSchema = z.object({
  label: ReactNodeSchema,
  valueLabel: ReactNodeSchema,
  icon: IconPropSchema,
  id: z.union([z.string(), z.number()]),
  value: z.any(),
  href: z.string(),
  isLocked: z.boolean(),
  isLoading: z.boolean(),
  isDisabled: z.boolean(),
  isVisible: z.boolean(),
  query: QuerySchema,
});

export type MenuModelParams = z.infer<typeof MenuModelParamsSchema>;

export const modelHasParam = <M extends MenuModel, N extends keyof MenuModelParams>(
  model: M,
  param: keyof MenuModelParams,
): model is M & { [key in N]: MenuModelParams[key] } => {
  const schema = MenuModelParamsSchema.pick({ [param]: true });
  const parseSuccess = schema.safeParse(model).success;
  if (param === "value") {
    return parseSuccess && model.value !== null && model.value !== undefined;
  }
  return parseSuccess;
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
    : ValueNotApplicable;

export const getModelValue = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValue<M, O> => {
  let v: unknown = VALUE_NOT_APPLICABLE;
  if (options.getItemValue !== undefined) {
    v = options.getItemValue(model);
  } else if (modelHasParam(model, "value")) {
    v = model.value;
  }
  if (v !== VALUE_NOT_APPLICABLE && !modelValueIsValid(v)) {
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
): ModelId<M, O> | undefined => {
  let v: unknown = "__NEVER__";
  if (options.getItemId !== undefined) {
    v = options.getItemId(model);
  } else if (modelHasParam(model, "id")) {
    v = model.id;
  }
  if (v !== "__NEVER__" && !modelIdIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid id for a menu item in the menu.`);
  }
  return v === "__NEVER__" ? undefined : (v as ModelId<M, O>);
};

export const modelLabelIsValid = (value: unknown) => isReactNode(value);

export type ModelLabel<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly label: infer L extends ReactNode;
}
  ? L
  : O extends { readonly getItemLabel: (m: M) => infer L extends ReactNode }
    ? L
    : never;

export const getModelLabel = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelLabel<M, O> | undefined => {
  let v: unknown = "__NEVER__";
  if (options.getItemLabel !== undefined) {
    v = options.getItemLabel(model);
  } else if (modelHasParam(model, "label")) {
    v = model.label;
  }
  if (v !== "__NEVER__" && !modelLabelIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid label for a menu item in the menu.`);
  }
  return v === "__NEVER__" ? undefined : (v as ModelLabel<M, O>);
};

export type ModelHref<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly href: infer L extends string;
}
  ? L
  : O extends { readonly getItemHref: (m: M) => infer L extends string }
    ? L
    : never;

export const getModelHref = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelHref<M, O> | undefined => {
  let v: unknown = "__NEVER__";
  if (options.getItemHref !== undefined) {
    v = options.getItemHref(model);
  } else if (modelHasParam(model, "href")) {
    v = model.href;
  }
  if (v !== "__NEVER__" && typeof v !== "string") {
    throw new TypeError(`The value '${v}' is not a valid href for a menu item in the menu.`);
  }
  return v === "__NEVER__" ? undefined : (v as ModelHref<M, O>);
};

export type ModelQuery<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly query: infer Q extends ItemQueryOption;
}
  ? Q
  : O extends { readonly getItemQuery: (m: M) => infer Q extends ItemQueryOption }
    ? Q
    : never;

export const getModelQuery = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelQuery<M, O> | undefined => {
  let v: unknown = "__NEVER__";
  if (options.getItemQuery !== undefined) {
    v = options.getItemQuery(model);
  } else if (modelHasParam(model, "query")) {
    v = model.query;
  }
  if (v !== "__NEVER__" && !QuerySchema.safeParse(v).success) {
    throw new TypeError(`The value '${v}' is not a valid query for a menu item in the menu.`);
  }
  return v === "__NEVER__" ? undefined : (v as ModelQuery<M, O>);
};

export const modelValueLabelIsValid = (value: unknown) => isReactNode(value);

export type ModelValueLabel<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly valueLabel: infer L extends ReactNode;
}
  ? L
  : O extends { readonly getItemValueLabel: (m: M) => infer L extends ReactNode }
    ? L
    : undefined;

export const getItemValueLabel = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValueLabel<M, O> => {
  let v: unknown = "__NEVER__";
  if (options.getItemValueLabel !== undefined) {
    v = options.getItemValueLabel(model);
  } else if (modelHasParam(model, "valueLabel")) {
    v = model.label;
  }
  if (v !== "__NEVER__" && !modelLabelIsValid(v)) {
    throw new TypeError(`The value '${v}' is not a valid value label for a menu item in the menu.`);
  }
  return v as ModelValueLabel<M, O>;
};

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
