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

export type SelectNullableValue<V, B extends SelectBehaviorType> = B extends "multi"
  ? V[]
  : B extends "single-nullable"
    ? V | null
    : B extends "single"
      ? V | null
      : never;

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

export type IfDataSelectDeselectable<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  T,
  F = never,
> = IfDeselectable<InferredDataSelectB<M, O>, T, F>;

export type IfClearable<B extends SelectBehaviorType, T, F = never> = B extends
  | "multi"
  | "single-nullable"
  ? T
  : F;

export type IfDataSelectClearable<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  T,
  F = never,
> = IfClearable<InferredDataSelectB<M, O>, T, F>;

export const isDeselectable = (behavior: SelectBehaviorType): boolean =>
  [SelectBehaviorTypes.MULTI, SelectBehaviorTypes.SINGLE_NULLABLE].includes(
    behavior as typeof SelectBehaviorTypes.MULTI | typeof SelectBehaviorTypes.SINGLE_NULLABLE,
  );

export const dataSelectIsDeselectable = <M extends DataSelectModel>(
  opts: DataSelectOptions<M>,
): boolean =>
  [SelectBehaviorTypes.MULTI, SelectBehaviorTypes.SINGLE_NULLABLE].includes(
    opts.behavior as typeof SelectBehaviorTypes.MULTI | typeof SelectBehaviorTypes.SINGLE_NULLABLE,
  );

export const isClearable = (behavior: SelectBehaviorType): boolean =>
  [SelectBehaviorTypes.MULTI, SelectBehaviorTypes.SINGLE_NULLABLE].includes(
    behavior as typeof SelectBehaviorTypes.MULTI | typeof SelectBehaviorTypes.SINGLE_NULLABLE,
  );

export const dataSelectIsClearable = <M extends DataSelectModel>(
  opts: DataSelectOptions<M>,
): boolean =>
  [SelectBehaviorTypes.MULTI, SelectBehaviorTypes.SINGLE_NULLABLE].includes(
    opts.behavior as typeof SelectBehaviorTypes.MULTI | typeof SelectBehaviorTypes.SINGLE_NULLABLE,
  );

export const ifDeselectable = <T, B extends SelectBehaviorType>(
  value: T,
  behavior: B,
): IfDeselectable<B, T> => (isDeselectable(behavior) ? value : undefined) as IfDeselectable<B, T>;

export const ifDataSelectDeselectable = <
  T,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
>(
  value: T,
  options: O,
): IfDataSelectDeselectable<M, O, T> =>
  (dataSelectIsDeselectable(options) ? value : undefined) as IfDataSelectDeselectable<M, O, T>;

export const ifClearable = <T, B extends SelectBehaviorType>(
  value: T,
  behavior: B,
): IfClearable<B, T> => (isClearable(behavior) ? value : undefined) as IfClearable<B, T>;

export const ifDataSelectClearable = <T, M extends DataSelectModel, O extends DataSelectOptions<M>>(
  value: T,
  options: O,
): IfDataSelectClearable<M, O, T> =>
  (dataSelectIsClearable(options) ? value : undefined) as IfDataSelectClearable<M, O, T>;

export type RootSelectInstance = {
  readonly focusInput: () => void;
  readonly setOpen: (v: boolean) => void;
  readonly setInputLoading: (v: boolean) => void;
  readonly setPopoverLoading: (v: boolean) => void;
};

export type SelectInstance<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = RootSelectInstance &
  Pick<ManagedSelectValue<V, B>, "clear" | "deselect" | "select" | "toggle"> & {
    readonly setValue: (v: SelectValue<V, B>) => void;
    readonly setLoading: (v: boolean) => void;
  };

export type DataSelectSelectInstance<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = SelectInstance<V, B> & {
  readonly setContentLoading: (v: boolean) => void;
};

export type DataSelectInstance<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectInstance<InferredDataSelectV<M, O>, InferredDataSelectB<M, O>> &
  Pick<ManagedSelectModelValue<M, O>, "selectModel" | "deselectModel" | "toggleModel"> & {
    readonly setContentLoading: (v: boolean) => void;
  };

export type AllowedSelectValue = string | number | Record<string, unknown>;

export type DataSelectModel<V extends AllowedSelectValue = AllowedSelectValue> = Omit<
  DataMenuModel,
  "onClick"
> & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    instance: MenuItemInstance,
    select: SelectInstance<V, B>,
  ) => void;
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

export type DataSelectNullableValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectNullableValue<InferredDataSelectV<M, O>, O["behavior"]>;

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

export type DataSelectNullableModelValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { behavior: "multi" }
  ? M[]
  : O extends { behavior: "single-nullable" }
    ? M | null
    : O extends { behavior: "single" }
      ? M | null
      : never;

export const SelectEvents = enumeratedLiterals(["select", "deselect", "clear"] as const, {});
export type SelectEvent = EnumeratedLiteralsMember<typeof SelectEvents>;

export type SelectEventRawParams<E extends SelectEvent, V extends AllowedSelectValue> = {
  readonly select: {
    readonly selected: V;
    readonly deselected?: never;
  };
  readonly deselect: {
    readonly selected?: never;
    readonly deselected: V;
  };
  readonly clear: {
    readonly selected?: never;
    readonly deselected?: never;
  };
}[E];

type SelectEventPartialParams<A extends SelectEvent> = {
  readonly select: {
    readonly item: MenuItemInstance;
  };
  readonly deselect: {
    readonly item: MenuItemInstance;
  };
  readonly clear: {
    readonly item?: never;
  };
}[A];

export type SelectEventParams<A extends SelectEvent, V extends AllowedSelectValue> = {
  readonly select: {
    readonly event: typeof SelectEvents.SELECT;
    readonly selected: V;
    readonly deselected?: never;
    readonly item: MenuItemInstance;
  };
  readonly deselect: {
    readonly event: typeof SelectEvents.DESELECT;
    readonly selected?: never;
    readonly deselected: V;
    readonly item: MenuItemInstance;
  };
  readonly clear: {
    readonly selected?: never;
    readonly deselected?: never;
    readonly item?: never;
    readonly event: typeof SelectEvents.CLEAR;
  };
}[A];

export const convertSelectEventRawParams = <E extends SelectEvent, V extends AllowedSelectValue>(
  raw: SelectEventRawParams<E, V>,
  event: E,
  params: SelectEventPartialParams<E>,
): SelectEventParams<E, V> =>
  ({
    ...raw,
    ...params,
    event,
  }) as SelectEventParams<E, V>;

export const NOTSET = "__NOTSET__" as const;
export type NotSet = typeof NOTSET;

export const DONOTHING = "__DONOTHING__" as const;
export type DoNothing = typeof DONOTHING;

export interface ManagedSelectValue<V extends AllowedSelectValue, B extends SelectBehaviorType> {
  readonly value: SelectNullableValue<V, B> | NotSet;
  readonly set: (
    value: SelectValue<V, B>,
    options?: { __private_ignore_controlled_state__: boolean },
  ) => void;
  readonly isSelected: (v: V) => boolean;
  /**
   * Clears the value of the select. This method is public-facing, and should be used to manipulate
   * the value of the select directly - it will NOT fire a change event.
   */
  readonly clear: IfClearable<B, () => void>;
  /**
   * Clears the value of the select. This method is NOT public-facing, and should not be used to
   * manipulate the value of the select directly (outside of the Select internals) - It will fire
   * a change event.
   */
  readonly __private__clear__: IfClearable<B, () => void>;
  /**
   * Deselects the item associated with the value {@link V} in the select.  If the item is already
   * deselected, no change will occur.  This method is NOT public-facing, and should not be used to
   * manipulate the value of the select directly (outside of the Select internals) - It will fire
   * a change event.
   */
  readonly __private__deselect__: IfDeselectable<
    B,
    (value: V, item: MenuItemInstance) => void,
    never
  >;
  /**
   * Deselects the item associated with the value {@link V} in the select.  If the item is already
   * deselected, no change will occur.  This method is public-facing, and should be used to
   * manipulate the value of the select directly - since it will NOT fire a change event.
   */
  readonly deselect: IfDeselectable<B, (value: V) => void, never>;
  /**
   * Selects the item associated with the value {@link V} in the select.  If the item is already
   * selected, no change will occur.  This method is NOT public-facing, and should not be used to
   * manipulate the value of the select directly (outside of the Select internals).  It will fire
   * a change event.
   */
  readonly __private__select__: (value: V, item: MenuItemInstance) => void;
  /**
   * Selects the item associated with the value {@link V} in the select.  If the item is already
   * selected, no change will occur.  This method is public-facing, and should be used to manipulate
   * the value of the select directly - since it will NOT fire a change event.
   */
  readonly select: (value: V) => void;
  /**
   * Toggles the selection state the item associated with the value {@link V} in the select.  This
   * method is NOT public-facing, and should NOT be used to manipulate the value of the select
   * directly (outside of the Select internals).  It will fire a change event.
   */
  readonly __private__toggle__: (value: V, item: MenuItemInstance) => void;
  /**
   * Toggles the selection state of the item associated with the value {@link V} in the select. This
   * method is public-facing, and should be used to manipulate the value of the select directly -
   * since it will NOT fire a change event.
   */
  readonly toggle: (value: V) => void;
}

export interface ManagedSelectModelValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  MV extends DataSelectNullableModelValue<M, O> | NotSet = DataSelectNullableModelValue<M, O>,
> extends ManagedSelectValue<InferredDataSelectV<M, O>, InferredDataSelectB<M, O>> {
  readonly modelValue: MV;
  readonly __private__select__model__: (m: M, item: MenuItemInstance) => void;
  readonly __private__deselect__model__: IfDataSelectDeselectable<
    M,
    O,
    (m: M, item: MenuItemInstance) => void
  >;
  readonly __private__toggle__model__: (m: M, item: MenuItemInstance) => void;
  readonly isModelSelected: (m: M) => boolean;
  readonly selectModel: (m: M) => void;
  readonly deselectModel: IfDataSelectDeselectable<M, O, (m: M) => void>;
  readonly toggleModel: (m: M) => void;
}

// ----- TODO: Clean These Up ----- //
export type DataSelectParams<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly modelValue: DataSelectModelValue<M, O>;
  readonly item?: MenuItemInstance;
};

export type SelectCallback<R, V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<V, B>,
) => R;

export type SelectManagedCallback<
  R,
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
  SV extends SelectValue<V, B> | SelectNullableValue<V, B> = SelectValue<V, B>,
> = (value: SV, params: Omit<ManagedSelectValue<V, B>, "value">) => R;

export type DataSelectCallback<R, M extends DataSelectModel, O extends DataSelectOptions<M>> = (
  value: DataSelectValue<M, O>,
  params: DataSelectParams<M, O>,
) => R;

export type DataSelectManagedCallback<
  R,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  V extends DataSelectValue<M, O> | DataSelectNullableValue<M, O> = DataSelectValue<M, O>,
> = (value: V, params: Omit<ManagedSelectModelValue<M, O>, "value">) => R;

export type SelectChangeHandler<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = SelectCallback<void, V, B>;

export type DataSelectChangeHandler<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  <E extends SelectEvent>(
    value: DataSelectValue<M, O>,
    modelValue: DataSelectModelValue<M, O>,
    params: SelectEventParams<E, InferredDataSelectV<M, O>>,
  ): void;
};

export type SelectValueRenderer<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = SelectManagedCallback<ReactNode, V, B>;

export type DataSelectValueRenderer<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = DataSelectCallback<ReactNode, M, O>;
