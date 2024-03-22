import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema } from "~/lib/core";
import { QueryDrawerIds } from "~/components/drawers";
import { IconPropSchema } from "~/components/icons";

import { type MenuOptions } from "./options";

export type MenuModel = Record<string, unknown>;

export const VALUE_NOT_APPLICABLE = "__VALUE_NOT_APPLICABLE__";
export type ValueNotApplicable = typeof VALUE_NOT_APPLICABLE;

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export const QuerySchema = z.object({
  params: z.record(z.string()),
  clear: z.union([z.string(), z.literal(true), z.array(z.string())]).optional(),
});

export const DrawerQuerySchema = z.object({
  param: QueryDrawerIds.schema,
  value: z.string(),
});

export const MenuModelParamsSchema = z.object({
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
  query: z.union([QuerySchema, DrawerQuerySchema]),
});

export type MenuModelParams = z.infer<typeof MenuModelParamsSchema>;

const isValidModelParam = <P extends keyof MenuModelParams>(
  value: unknown,
  param: P,
): value is MenuModelParams[P] => {
  const schema = MenuModelParamsSchema.pick({ [param]: true });
  let isValid = schema.safeParse({ [param]: value }).success;
  if (param === "value") {
    isValid = isValid && value !== null;
  }
  return isValid;
};

export const validateModelParam = <N extends keyof MenuModelParams>(
  value: unknown,
  param: N,
): MenuModelParams[N] => {
  const isValid = isValidModelParam(value, param);
  if (!isValid) {
    throw new TypeError(
      `The value '${String(value)}' is not a valid value for parameter '${param}' ` +
        "on a given menu item.",
    );
  }
  return value;
};

export const modelHasParam = <M extends MenuModel, N extends keyof MenuModelParams>(
  model: M,
  param: N,
): model is M & { [key in N]: MenuModelParams[key] } => {
  if (param in model && model[param] !== undefined) {
    validateModelParam(model[param], param);
    return true;
  }
  return false;
};

export type ModelValue<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly value: infer V;
}
  ? V
  : O extends { readonly getItemValue: (m: M) => infer V }
    ? V
    : never;

export const getModelValue = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValue<M, O> | ValueNotApplicable => {
  let v: unknown = VALUE_NOT_APPLICABLE;
  if (options.getItemValue !== undefined) {
    v = options.getItemValue(model);
  } else if (modelHasParam(model, "value")) {
    v = model.value;
  }
  return v as ModelValue<M, O>;
};

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
  let v: string | number | Never = NEVER;
  if (options.getItemId !== undefined) {
    v = validateModelParam(options.getItemId(model), "id");
  } else if (modelHasParam(model, "id")) {
    v = model.id;
  }
  return v === NEVER ? undefined : (v as ModelId<M, O>);
};

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
  let v: ReactNode | Never = NEVER;
  if (options.getItemLabel !== undefined) {
    v = options.getItemLabel(model);
  } else if (modelHasParam(model, "label")) {
    v = model.label;
  }
  return v === NEVER ? undefined : (v as ModelLabel<M, O>);
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
  let v: string | Never = NEVER;
  if (options.getItemHref !== undefined) {
    v = options.getItemHref(model);
  } else if (modelHasParam(model, "href")) {
    v = model.href;
  }
  return v === NEVER ? undefined : (v as ModelHref<M, O>);
};

export type ModelQuery<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly query: infer Q extends z.infer<typeof MenuModelParamsSchema>["query"];
}
  ? Q
  : O extends {
        readonly getItemQuery: (
          m: M,
        ) => infer Q extends z.infer<typeof MenuModelParamsSchema>["query"];
      }
    ? Q
    : never;

export const getModelQuery = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelQuery<M, O> | undefined => {
  let v: z.infer<typeof MenuModelParamsSchema>["query"] | Never = NEVER;
  if (options.getItemQuery !== undefined) {
    v = options.getItemQuery(model);
  } else if (modelHasParam(model, "query")) {
    v = model.query;
  }
  return v === NEVER ? undefined : (v as ModelQuery<M, O>);
};

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
): ModelValueLabel<M, O> | undefined => {
  let v: ReactNode | Never = NEVER;
  if (options.getItemValueLabel !== undefined) {
    v = options.getItemValueLabel(model);
  } else if (modelHasParam(model, "valueLabel")) {
    v = model.valueLabel;
  }
  return v === NEVER ? undefined : (v as ModelValueLabel<M, O>);
};
