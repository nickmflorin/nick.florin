import { type ReactNode } from "react";

import { z } from "zod";

import { ReactNodeSchema } from "~/lib/core";
import { type MenuModel } from "~/components/menus";

import { type SelectOptions } from "./options";

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type AllowedSelectModelValue = string;

export type SelectModel<V extends AllowedSelectModelValue = AllowedSelectModelValue> = MenuModel & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
};

export type SelectValueDatum<M extends SelectModel, O extends SelectOptions<M>> = {
  readonly value: SelectModelValue<M, O>;
  readonly label: ReactNode;
  readonly id: string;
};

const SelectValueDatumSchema = z
  .object({
    value: z.string(),
    label: ReactNodeSchema,
    id: z.string(),
  })
  .strict();

export const isSelectValueDatum = <M extends SelectModel, O extends SelectOptions<M>>(
  v: unknown,
): v is SelectValueDatum<M, O> => SelectValueDatumSchema.safeParse(v).success;

export type SelectModelValue<M extends SelectModel, O extends SelectOptions<M>> = M extends {
  readonly value: infer V extends AllowedSelectModelValue;
}
  ? V
  : O extends { readonly getModelValue: (m: M) => infer V extends AllowedSelectModelValue }
    ? V
    : never;

export const getSelectModelValue = <M extends SelectModel, O extends SelectOptions<M>>(
  model: M,
  options: O,
): SelectModelValue<M, O> => {
  let v: AllowedSelectModelValue | undefined = undefined;
  if (options.getModelValue !== undefined) {
    v = options.getModelValue(model);
  } else if (model.value !== undefined) {
    v = model.value;
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
      isNullable: options?.isNullable ?? false,
    });
  } else if (model.valueLabel !== undefined) {
    v = model.valueLabel;
  }
  return v === NEVER ? undefined : (v as SelectModelValueLabel<M, O>);
};
