import { type ReactNode } from "react";

import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { type DataMenuModel, type MenuItemInstance } from "~/components/menus";

export const SelectBehaviorTypes = enumeratedLiterals(
  ["multi", "single-nullable", "single"] as const,
  {},
);
export type SelectBehaviorType = EnumeratedLiteralsMember<typeof SelectBehaviorTypes>;

type SelectBehaviorTypeParams =
  | { isMulti: true; isNullable?: never }
  | { isMulti?: false; isNullable?: true; isDeselectable?: true };

type SelectBehaviorFromParams<T extends SelectBehaviorTypeParams> = T extends { isMulti: true }
  ? typeof SelectBehaviorTypes.MULTI
  : T extends { isNullable: true }
    ? typeof SelectBehaviorTypes.SINGLE_NULLABLE
    : typeof SelectBehaviorTypes.SINGLE;

export const SelectBehavior = <T extends SelectBehaviorTypeParams>(
  params: T,
): SelectBehaviorFromParams<T> => {
  if (params.isMulti) {
    return SelectBehaviorTypes.MULTI as SelectBehaviorFromParams<T>;
  } else if (params.isNullable) {
    return SelectBehaviorTypes.SINGLE_NULLABLE as SelectBehaviorFromParams<T>;
  }
  return SelectBehaviorTypes.SINGLE as SelectBehaviorFromParams<T>;
};

export type SelectValue<V, B extends SelectBehaviorType> = B extends "multi"
  ? V[]
  : B extends "single-nullable"
    ? V | null
    : B extends "single"
      ? V
      : never;

export type IfSingleNullable<
  B extends SelectBehaviorType,
  T,
  F = never,
> = B extends "single-nullable" ? T : F;

export type IfMulti<B extends SelectBehaviorType, T, F = never> = B extends "multi" ? T : F;

export type IfSingle<B extends SelectBehaviorType, T, F = never> = B extends "single" ? T : F;

export type IfDeselectable<B extends SelectBehaviorType, T, F = never> = B extends
  | "multi"
  | "single-nullable"
  ? T
  : F;

export type BasicSelectInstance = {
  readonly focusInput: () => void;
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectInstance<V, B extends SelectBehaviorType> = BasicSelectInstance & {
  readonly setValue: (v: SelectValue<V, B>) => void;
  readonly clear: () => void;
};

export type DataSelectInstance<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectInstance<InferredDataSelectV<M, O>, InferredDataSelectB<M, O>>;

export type AllowedSelectValue = string | number | Record<string, unknown>;

export type DataSelectModel<V extends AllowedSelectValue = AllowedSelectValue> = DataMenuModel & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
};

export type DataSelectOptions<
  M extends DataSelectModel,
  B extends SelectBehaviorType = SelectBehaviorType,
> = B extends SelectBehaviorType
  ? {
      readonly behavior: SelectBehaviorType;
      readonly getItemValue?: (model: M) => AllowedSelectValue;
    }
  : never;

export type InferredDataSelectV<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { getItemValue: (m: M) => infer V extends AllowedSelectValue }
  ? V
  : M extends { value: infer V extends AllowedSelectValue }
    ? V
    : never;

export type InferredDataSelectB<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { behavior: infer B extends SelectBehaviorType } ? B : never;

export type DataSelectValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectValue<InferredDataSelectV<M, O>, O["behavior"]>;

export type DataSelectModelValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { behavior: "multi" }
  ? M[]
  : O extends { behavior: "single-nullable" }
    ? M | null
    : O extends { behavior: "single" }
      ? M
      : never;

export type SelectEvent = "select" | "deselect" | "clear";

export type SelectEventParams<A extends SelectEvent, V extends AllowedSelectValue> = {
  readonly select: { selected: V; deselected?: never };
  readonly deselect: { selected?: never; deselected: V };
  readonly clear: { selected?: never; deselected?: never };
}[A];

export const NOTSET = "__NOTSET__" as const;
export type NotSet = typeof NOTSET;

export interface ManagedSelectValue<V extends AllowedSelectValue, B extends SelectBehaviorType> {
  readonly value: SelectValue<V, B>;
  readonly set: (
    value: SelectValue<V, B>,
    options?: { __private_ignore_controlled_state__: boolean },
  ) => void;
  readonly clear: () => void;
  readonly isSelected: (v: V) => boolean;
  readonly deselect: IfDeselectable<B, (value: V, item?: MenuItemInstance) => void, never>;
  readonly select: (value: V, item?: MenuItemInstance) => void;
  readonly toggle: (value: V, item?: MenuItemInstance) => void;
}

export interface ManagedSelectModelValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  MV extends DataSelectModelValue<M, O> | NotSet = DataSelectModelValue<M, O>,
> extends ManagedSelectValue<InferredDataSelectV<M, O>, O["behavior"]> {
  readonly modelValue: MV;
  readonly isModelSelected: (m: M) => boolean;
  readonly selectModel: (m: M, item?: MenuItemInstance) => void;
  readonly deselectModel: (m: M, item?: MenuItemInstance) => void;
  readonly toggleModel: (m: M, item?: MenuItemInstance) => void;
}

export type DataSelectParams<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly modelValue: DataSelectModelValue<M, O>;
  readonly item?: MenuItemInstance;
};

export type SelectCallback<R, V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<V, B>,
) => R;

export type SelectManagedCallback<R, V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<V, B>,
  params: Omit<ManagedSelectValue<V, B>, "value">,
) => R;

export type DataSelectCallback<R, M extends DataSelectModel, O extends DataSelectOptions<M>> = (
  value: DataSelectValue<M, O>,
  params: DataSelectParams<M, O>,
) => R;

export type DataSelectManagedCallback<
  R,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (value: DataSelectValue<M, O>, params: Omit<ManagedSelectModelValue<M, O>, "value">) => R;

export type SelectChangeHandler<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = SelectCallback<void, V, B>;

export type DataSelectChangeHandler<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = DataSelectCallback<void, M, O>;

export type SelectValueRenderer<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = SelectManagedCallback<ReactNode, V, B>;

export type DataSelectValueRenderer<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = DataSelectCallback<ReactNode, M, O>;
