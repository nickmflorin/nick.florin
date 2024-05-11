import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema } from "~/lib/core";
import { type MenuModel } from "~/components/menus";

import { type SelectOptions } from "./options";

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type AllowedSelectModelValue = string;

export type SelectModel<V extends AllowedSelectModelValue> = MenuModel & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
};

export type SelectValueModel<V extends AllowedSelectModelValue = AllowedSelectModelValue> = {
  readonly value: V;
  readonly label: ReactNode;
  readonly id?: string;
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

export const isSelectValueModel = <V extends AllowedSelectModelValue>(
  v: unknown,
): v is SelectValueModel<V> => SelectValueModelSchema.safeParse(v).success;

export const selectValueModel = <V extends AllowedSelectModelValue = AllowedSelectModelValue>(
  params: Omit<SelectValueModel<V>, "__valueModel__">,
): SelectValueModel<V> => ({
  ...params,
  __valueModel__: true,
});

export const getSelectModelValue = <
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
>(
  model: M,
  options: O,
): V => {
  let v: V | undefined = undefined;
  if (options.getModelValue !== undefined) {
    v = options.getModelValue(model) as V;
  } else if (model.value !== undefined) {
    v = model.value;
  }
  if (v === undefined) {
    throw new Error(
      "The model value is undefined!  The model must either define a 'value' attribute or " +
        "the 'getModelValue' option must be provided.",
    );
  }
  return v as V;
};

export type SelectModelValueLabel<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
> = M extends {
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

export const getSelectModelValueLabel = <
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends SelectOptions<V, M>,
>(
  model: M,
  options: O,
): SelectModelValueLabel<V, M, O> | undefined => {
  let v: ReactNode | Never = NEVER;
  if (options.getModelValueLabel !== undefined) {
    v = options.getModelValueLabel(model, {
      isMulti: options?.isMulti ?? false,
      isNullable: options?.isNullable ?? false,
    });
  } else if (model.valueLabel !== undefined) {
    v = model.valueLabel;
  }
  return v === NEVER ? undefined : (v as SelectModelValueLabel<V, M, O>);
};

export type SelectData<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends { isValueModeled?: boolean },
> = O extends { isValueModeled: true } ? never : M[];

export type SelectDataValue<
  V extends AllowedSelectModelValue,
  O extends { isValueModeled?: boolean },
> = O extends { isValueModeled: true } ? SelectValueModel<V> : V;

export type SelectValue<
  V extends AllowedSelectModelValue,
  O extends { isMulti?: boolean; isNullable?: boolean; isValueModeled?: boolean },
> = O extends {
  isMulti: true;
}
  ? SelectDataValue<V, O>[]
  : O extends { isNullable: true }
    ? SelectDataValue<V, O> | null
    : SelectDataValue<V, O>;

export type SelectDataModel<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends { isValueModeled?: boolean },
> = O extends { isValueModeled: true } ? M : SelectValueModel<V>;

export type SelectModeledValue<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
  O extends { isMulti?: boolean; isNullable?: boolean; isValueModeled?: boolean },
> = O extends {
  isMulti: true;
}
  ? SelectDataModel<V, M, O>[]
  : O extends { isNullable: true }
    ? SelectDataModel<V, M, O> | null
    : SelectDataModel<V, M, O>;
