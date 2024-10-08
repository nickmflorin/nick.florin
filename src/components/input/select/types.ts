import { isValidElement, type ReactNode } from "react";

import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import {
  type DataMenuModel,
  type MenuItemInstance,
  type MenuItemClickEvent,
  type BaseDataMenuModel,
} from "~/components/menus";

export const NOTSET = "__NOTSET__" as const;
export type NotSet = typeof NOTSET;

export const DONOTHING = "__DONOTHING__" as const;
export type DoNothing = typeof DONOTHING;

export const SelectEvents = enumeratedLiterals(["select", "deselect", "clear"] as const, {});
export type SelectEvent = EnumeratedLiteralsMember<typeof SelectEvents>;

export const SelectBehaviorTypes = enumeratedLiterals(
  ["multi", "single-nullable", "single"] as const,
  {},
);
export type SelectBehaviorType = EnumeratedLiteralsMember<typeof SelectBehaviorTypes>;

/**
 * Represents the value that a Select exhibits, allowing null values for cases where the Select is
 * single but non-nullable.  The form of this value depends on the behavior of the Select,
 * {@link SelectBehaviorType}.
 *
 * This type is used to represent the initial value of a Select before an interaction (select,
 * deselect, etc.) occurs.  In the case of a single, non-nullable Select, the initial value - before
 * any interaction occurs - can still be null.  However, once the first interaction occurs, the
 * value will never be null again.  This type is used to represent the Select's value that accounts
 * for this specific case.
 */
export type SelectNullableValue<V, B extends SelectBehaviorType> = B extends "multi"
  ? V[]
  : B extends "single-nullable"
    ? V | null
    : B extends "single"
      ? V | null
      : never;

/**
 * Represents the value that a Select exhibits.  The form of this value depends on the behavior
 * of the Select, {@link SelectBehaviorType}.
 */
export type SelectValue<V, B extends SelectBehaviorType> = B extends "multi"
  ? V[]
  : B extends "single-nullable"
    ? V | null
    : B extends "single"
      ? V
      : never;

export type AllowedSelectValue = string | number | Record<string, unknown>;

export type DataSelectOptions<
  M extends DataSelectModel,
  B extends SelectBehaviorType = SelectBehaviorType,
> = {
  readonly behavior: B;
  readonly getItemValue?: (model: M) => AllowedSelectValue;
};

export interface DataSelectModel<V extends AllowedSelectValue = AllowedSelectValue>
  extends DataMenuModel {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
}

export type ConnectedDataSelectModel<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = M & {
  readonly onClick?: (
    e: MenuItemClickEvent,
    instance: MenuItemInstance,
    select: DataSelectInstance<M, O>,
  ) => void;
};

export type InferredDataSelectValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { getItemValue: (m: M) => infer V extends AllowedSelectValue }
  ? V
  : M extends DataSelectModel<infer V extends AllowedSelectValue>
    ? V
    : never;

export type InferredDataSelectBehavior<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { behavior: infer B extends SelectBehaviorType } ? B : never;

export type DataSelectValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectValue<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>>;

export type DataSelectNullableValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectNullableValue<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>>;

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
> = IfDeselectable<InferredDataSelectBehavior<M, O>, T, F>;

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
> = IfClearable<InferredDataSelectBehavior<M, O>, T, F>;

const DESELECTABLE_BEHAVIORS = [
  SelectBehaviorTypes.MULTI,
  SelectBehaviorTypes.SINGLE_NULLABLE,
] as const;

export type DeselectableSelectBehavior = (typeof DESELECTABLE_BEHAVIORS)[number];

const CLEARABLE_BEHAVIORS = [
  SelectBehaviorTypes.MULTI,
  SelectBehaviorTypes.SINGLE_NULLABLE,
] as const;

export type ClearableSelectBehavior = (typeof CLEARABLE_BEHAVIORS)[number];

export const isDeselectable = (
  behavior: SelectBehaviorType,
): behavior is DeselectableSelectBehavior =>
  DESELECTABLE_BEHAVIORS.includes(behavior as DeselectableSelectBehavior);

export const dataSelectIsDeselectable = <M extends DataSelectModel>(
  opts: DataSelectOptions<M>,
): opts is DataSelectOptions<M, DeselectableSelectBehavior> =>
  DESELECTABLE_BEHAVIORS.includes(opts.behavior as DeselectableSelectBehavior);

export const isClearable = (behavior: SelectBehaviorType): behavior is ClearableSelectBehavior =>
  CLEARABLE_BEHAVIORS.includes(behavior as ClearableSelectBehavior);

export const dataSelectIsClearable = <M extends DataSelectModel>(
  opts: DataSelectOptions<M>,
): opts is DataSelectOptions<M, ClearableSelectBehavior> =>
  CLEARABLE_BEHAVIORS.includes(opts.behavior as ClearableSelectBehavior);

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
    // The item may be undefined if the deselection was triggered from a badge close event.
    readonly item?: MenuItemInstance;
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
    // The item may be undefined if the deselection was triggered from a badge close event.
    readonly item?: MenuItemInstance;
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
    (value: V, item?: MenuItemInstance) => void,
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
> extends ManagedSelectValue<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>> {
  readonly modelValue: MV;
  readonly isModelSelected: (m: M) => boolean;
  readonly selectModel: (m: M) => void;
  readonly deselectModel: IfDataSelectDeselectable<M, O, (m: M) => void>;
  readonly toggleModel: (m: M) => void;
  readonly __private__deselect__model__: IfDataSelectDeselectable<
    M,
    O,
    (m: M, item?: MenuItemInstance) => void
  >;
  readonly __private__select__model__: (m: M, item: MenuItemInstance) => void;
  readonly __private__toggle__model__: (m: M, item: MenuItemInstance) => void;
  readonly __private__clear__: IfDataSelectClearable<M, O, () => void>;
}

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
  Omit<ManagedSelectValue<V, B>, "value"> & {
    readonly setValue: (v: SelectValue<V, B>) => void;
    readonly setLoading: (v: boolean) => void;
  };

export type DataSelectInstance<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectInstance<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>> &
  Omit<ManagedSelectModelValue<M, O>, "value" | "modelValue"> & {
    readonly setContentLoading: (v: boolean) => void;
  };

export type DataSelectCustomItemRenderer<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (instance: MenuItemInstance, select: DataSelectInstance<M, O>) => JSX.Element;

export type DataSelectCustomMenuItem<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = Omit<BaseDataMenuModel, "onClick"> & {
  readonly renderer?: DataSelectCustomItemRenderer<M, O>;
  readonly onClick?: (
    e: MenuItemClickEvent,
    instance: MenuItemInstance,
    select: DataSelectInstance<M, O>,
  ) => void;
};

export const dataSelectCustomItemIsObject = <
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
>(
  obj: DataSelectCustomMenuItem<M, O> | JSX.Element,
): obj is DataSelectCustomMenuItem<M, O> => !isValidElement(obj);

export type SelectChangeHandler<V extends AllowedSelectValue, B extends SelectBehaviorType> = {
  <E extends SelectEvent>(value: SelectValue<V, B>, params: SelectEventParams<E, V>): void;
};

export type DataSelectChangeHandler<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  <E extends SelectEvent>(
    value: DataSelectValue<M, O>,
    modelValue: DataSelectModelValue<M, O>,
    params: SelectEventParams<E, InferredDataSelectValue<M, O>>,
  ): void;
};

export type SelectValueRenderer<V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<V, B>,
  select: SelectInstance<V, B>,
) => ReactNode;

export type DataSelectValueRenderer<M extends DataSelectModel, O extends DataSelectOptions<M>> = (
  value: DataSelectValue<M, O>,
  modelValue: DataSelectModelValue<M, O>,
  select: DataSelectInstance<M, O>,
) => ReactNode;
