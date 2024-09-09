import { type ReactNode } from "react";

import { type Assign } from "utility-types";
import { z } from "zod";

import { ReactNodeSchema } from "~/lib/core";

import { type MenuModel } from "~/components/menus";

import { type SelectOptions } from "./options";

export const VALUE_NOT_SET = "__VALUE_NOT_SET__" as const;
export type ValueNotSet = typeof VALUE_NOT_SET;

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type AllowedSelectModelValue = string;

export type SelectModelValue<
  M extends SelectModel,
  O extends SelectOptions<M>,
> = O["getModelValue"] extends ((...args: any[]) => infer V extends AllowedSelectModelValue)
  ? V
  : M extends { readonly value: infer V extends AllowedSelectModelValue }
    ? V
    : AllowedSelectModelValue;

export type SelectModel<V extends AllowedSelectModelValue = AllowedSelectModelValue> = MenuModel & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
};

export type UnsafeSelectValueModel<M extends SelectModel, O extends SelectOptions<M>> = {
  readonly value: SelectModelValue<M, O>;
  readonly label: ReactNode;
  readonly id?: string;
};

export type SelectValueModel<
  M extends SelectModel,
  O extends SelectOptions<M>,
> = UnsafeSelectValueModel<M, O> & {
  readonly __valueModel__: true;
};

const SelectValueModelSchema = z
  .object({
    value: z.string(),
    label: ReactNodeSchema,
    id: z.string().optional(),
    __valueModel__: z.literal(true),
  })
  .strict();

export const isSelectValueModel = <M extends SelectModel, O extends SelectOptions<M>>(
  v: unknown,
): v is SelectValueModel<M, O> => SelectValueModelSchema.safeParse(v).success;

export const selectValueModel = <M extends SelectModel, O extends SelectOptions<M>>(
  params: Omit<SelectValueModel<M, O>, "__valueModel__">,
): SelectValueModel<M, O> => ({
  ...params,
  __valueModel__: true,
});

export const getSelectModelValue = <M extends SelectModel, O extends SelectOptions<M>>(
  model: M,
  options: O,
): SelectModelValue<M, O> => {
  let v: SelectModelValue<M, O> | undefined = undefined;
  if (options.getModelValue !== undefined) {
    v = options.getModelValue(model) as SelectModelValue<M, O>;
  } else if (model.value !== undefined) {
    v = model.value as SelectModelValue<M, O>;
  }
  if (v === undefined) {
    throw new Error(
      "The model value is undefined!  The model must either define a 'value' attribute or " +
        "the 'getModelValue' option must be provided.",
    );
  }
  return v as SelectModelValue<M, O>;
};

export type SelectModelValueLabel<M extends SelectModel, O extends SelectOptions<M>> = M extends {
  readonly valueLabel: infer L extends ReactNode;
}
  ? L
  : O extends {
        readonly getModelValueLabel: (
          m: M,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          o: any,
        ) => infer L extends ReactNode;
      }
    ? L
    : undefined;

export const getSelectModelValueLabel = <M extends SelectModel, O extends SelectOptions<M>>(
  model: M,
  options: O,
): SelectModelValueLabel<M, O> | undefined => {
  let v: ReactNode | Never = NEVER;
  if (options.getModelValueLabel !== undefined) {
    v = options.getModelValueLabel(model, {
      isMulti: options?.isMulti ?? false,
      isDeselectable: options?.isDeselectable ?? false,
    });
  } else if (model.valueLabel !== undefined) {
    v = model.valueLabel;
  }
  return v === NEVER ? undefined : (v as SelectModelValueLabel<M, O>);
};

export type UnsafeSelectValueForm<M extends SelectModel, O extends SelectOptions<M>> = O extends {
  isValueModeled: true;
}
  ? UnsafeSelectValueModel<M, O>
  : SelectModelValue<M, O>;

export type SelectValueForm<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = V extends UnsafeSelectValueModel<M, O> ? Assign<V, { __valueModel__: true }> : V;

export type SelectValue<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = O extends {
  isMulti: true;
}
  ? SelectValueForm<V, M, O>[]
  : O extends { isDeselectable: true }
    ? SelectValueForm<V, M, O> | null
    : SelectValueForm<V, M, O>;

export type UnsafeSelectValue<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = O extends {
  isMulti: true;
}
  ? V[]
  : O extends { isDeselectable: true }
    ? V | null
    : V;

export type SelectDataModel<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = V extends UnsafeSelectValueModel<M, O> ? SelectValueForm<V, M, O> : M;

export type SelectModeledValue<
  V extends UnsafeSelectValueForm<M, O>,
  M extends SelectModel,
  O extends SelectOptions<M>,
> = O extends {
  isMulti: true;
}
  ? SelectDataModel<V, M, O>[]
  : O extends { isDeselectable: true }
    ? SelectDataModel<V, M, O> | null
    : SelectDataModel<V, M, O>;
