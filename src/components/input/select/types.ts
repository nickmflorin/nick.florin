import { isValidElement, type ReactNode } from "react";

import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { type Prettify } from "~/lib/types";

import {
  type DataMenuModel,
  type MenuItemInstance,
  type ConnectedMenuItemInstance,
  type MenuItemClickEvent,
  type DataMenuCustomModel,
  type DisconnectedMenuItemInstance,
  type CreateDataMenuItemInstanceRT,
  type DataMenuItemInstanceLookupArg,
  type CreateDataMenuItemInstanceOptions,
} from "~/components/menus";

export const NOTSET = "__NOTSET__" as const;
export type NotSet = typeof NOTSET;

export const DONOTHING = "__DONOTHING__" as const;
export type DoNothing = typeof DONOTHING;

export const SelectEvents = enumeratedLiterals(["select", "deselect", "clear"] as const, {});
export type SelectEvent = EnumeratedLiteralsMember<typeof SelectEvents>;

/**
 * Represents the primitives that are allowed to represent the value of individual items in a
 * Select.
 */
export type AllowedSelectValue = string | number;

/* ------------------------------ Select Behaviors ------------------------------ */
export const SelectBehaviorTypes = enumeratedLiterals(
  ["multi", "single-nullable", "single"] as const,
  {},
);
export type SelectBehaviorType = EnumeratedLiteralsMember<typeof SelectBehaviorTypes>;

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

/* ------------------------------ Select Modeling ------------------------------ */
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
export type SelectNullableValue<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = B extends "multi"
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
export type SelectValue<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = B extends "multi"
  ? V[]
  : B extends "single-nullable"
    ? V | null
    : B extends "single"
      ? V
      : never;

export type DataSelectOptions<
  M extends DataSelectModel,
  B extends SelectBehaviorType = SelectBehaviorType,
> = {
  readonly behavior: B;
  readonly getItemValue?: (model: M) => AllowedSelectValue;
};

export interface DataSelectModel<V extends AllowedSelectValue = AllowedSelectValue>
  extends Omit<DataMenuModel, "refKey"> {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
  readonly value?: V;
  readonly refKey?: never;
}

export type ConnectedDataSelectModel<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = M & {
  readonly onClick?: (
    e: MenuItemClickEvent,
    instance: ConnectedMenuItemInstance,
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

/**
 * Represents the value that a DataSelect exhibits.  The form of this value depends on the behavior
 * of the DataSelect, {@link SelectBehaviorType}, which is specified in the options
 * {@link DataSelectOptions} that are provided to the DataSelect as a prop.
 */
export type DataSelectValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectValue<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>>;

/**
 * Represents the value that a DataSelect exhibits, allowing null values for cases where the
 * DataSelect is single but non-nullable.  The form of this value depends on the behavior of the
 * DataSelect, {@link SelectBehaviorType}, which is specified in the options
 * {@link DataSelectOptions} that are provided to the DataSelect as a prop.
 *
 * This type is used to represent the initial value of a DataSelect before an interaction (select,
 * deselect, etc.) occurs.  In the case of a single, non-nullable DataSelect, the initial value
 * - before any interaction occurs - can still be null.  However, once the first interaction occurs,
 * the value will never be null again.  This type is used to represent the DataSelect's value that
 * accounts for this specific case.
 */
export type DataSelectNullableValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = SelectNullableValue<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>>;

/**
 * Represents the model {@link M} or models {@link M[]} that are associated with the value that a
 * DataSelect exhibits.  The form of this value depends on the behavior of the Select,
 * {@link SelectBehaviorType}.
 */
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

/**
 * Represents the model {@link M} or models {@link M[]} that are associated with the value that
 * a DataSelect exhibits, allowing null values for cases where the DataSelect is single but
 * non-nullable.  The form of this value depends on the behavior of the Select,
 * {@link SelectBehaviorType}, which is specified in the options {@link DataSelectOptions} that are
 * provided to the DataSelect as a prop.
 *
 * This type is used to represent the model {@link M} associated with the initial value of a
 * DataSelect before an interaction (select, deselect, etc.) occurs.  In the case of a single,
 * non-nullable DataSelect, the initial value - before any interaction occurs - can still be null.
 * However, once the first interaction occurs, the value will never be null again.  This type is
 * used to represent the model {@link M} associated with DataSelect's value that accounts for this
 * specific case.
 */
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

/* ------------------------------ Select Change Handlers ------------------------------ */
export type SelectEventRecord<E extends SelectEvent, V extends AllowedSelectValue> = {
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

export type SelectEventPublicArgs = {
  readonly dispatchChangeEvent?: boolean;
};

export type DataSelectEventPublicArgs<A extends SelectEvent> = {
  readonly select:
    | {
        /* Can either be connected or disconnected, depending on the manner in which the selection
           occurs.  See the docstring on the EventItemParam type. */
        readonly item: MenuItemInstance;
        readonly dispatchChangeEvent?: true;
      }
    | {
        readonly dispatchChangeEvent: false;
        readonly item?: never;
      };
  readonly deselect:
    | {
        /* Can either be connected or disconnected, depending on the manner in which the deselection
           occurs.  See the docstring on the EventItemParam type. */
        readonly item: MenuItemInstance;
        readonly dispatchChangeEvent?: true;
      }
    | {
        readonly dispatchChangeEvent: false;
        readonly item?: never;
      };
  readonly clear: {
    readonly item?: never;
    readonly dispatchChangeEvent?: boolean;
  };
}[A];

/**
 * Represents the presence, or lack of presence, of the {@link MenuItemInstance} associated with
 * the MenuItem that may be relevant when a {@link SelectEvent} occurs.
 *
 * For a selection that occurs as a result of a MenuItem click (or a Checkbox selection made
 * in regard to the Checkbox inside the MenuItem) or a deselection that occurs as a result of a
 * MenuItem click (or a Checkbox deselection made in regard to the Checkbox inside the MenuItem),
 * the {@link MenuItemInstance} will always be available and "connected" to the MenuItem in the
 * UI.  In other words, the instance will always be of type {@link ConnectedMenuItemInstance} (a
 * more specific type than {@link MenuItemInstance}).  This is because the {@link MenuItemInstance}
 * becomes connected to the MenuItem in the UI when the MenuItem is rendered in the UI - and if the
 * selection or deselection occurs in the previously mentioned manners, the MenuItem would have had
 * to be rendered in the UI.
 *
 * However, the {@link MenuItemInstance} attached to the event parameters,
 * {@link SelectEventChangeParams}, may not be "connected" (and would be of type
 * {@link DisconnectedMenuItemInstance}) in multiple scenarios:
 *
 * 1. When a selection occurs for a model that has _just_ been added optimistically, the MenuItem
 *    may not have been rendered in the UI at that point in time, because the selection occurs
 *    immediately after the model is added to the data, but before the menu has a chance to
 *    rerender.  This means that the ref associated with the item's instance will not be attached
 *    to the MenuItem yet.
 *
 * 2. When a deselection occurs as a result of clicking on the "Close Button" (X) inside of a
 *    Badge in the Select's Input, the item's instance may not be available, because the Badge may
 *    correspond to an item that is currently not rendered in the UI due to filtering or searching
 *    of the original data.
 *
 * In both of these cases, and potentially different future cases as well, the
 * {@link MenuItemInstance} will still be non-null, but will be of type
 * {@link DisconnectedMenuItemInstance}.  In other words, the {@link MenuItemInstance} included
 * in the event params, {@link SelectEventChangeParams}, will not be connected to a MenuItem
 * that is rendered in the UI and the methods attached to the instance will not have an affect.
 *
 * The methods of the {@link DisconnectedMenuItemInstance} will not have an affect on the MenuItem,
 * but they will log a warning that the method is being called for a {@link MenuItemInstance} that
 * is not yet connected to a MenuItem in the UI.
 */
type EventItemParam<E extends SelectEvent> = E extends typeof SelectEvents.SELECT
  ? { readonly item: MenuItemInstance }
  : E extends typeof SelectEvents.DESELECT
    ? { readonly item: MenuItemInstance }
    : { readonly item?: never };

type SelectArg0 = DataSelectModel | AllowedSelectValue;
type SelectArg1<M extends SelectArg0> = M extends DataSelectModel
  ? DataSelectOptions<M>
  : M extends AllowedSelectValue
    ? SelectBehaviorType
    : never;

type InferV<Arg0 extends SelectArg0, Arg1 extends SelectArg1<Arg0>> = Arg0 extends DataSelectModel
  ? Arg1 extends DataSelectOptions<Arg0>
    ? InferredDataSelectValue<Arg0, Arg1>
    : never
  : Arg0;

export type SelectEventChangeParams<
  E extends SelectEvent,
  V extends AllowedSelectValue,
> = E extends SelectEvent
  ? Prettify<
      SelectEventRecord<E, V> & {
        readonly event: E;
      }
    >
  : never;

/* export type DataSelectBaseEventChangeParams<
     E extends SelectEvent,
     M extends DataSelectModel,
     O extends DataSelectOptions<M>,
   > = E extends SelectEvent
     ? Prettify<
         SelectEventRecord<E, InferredDataSelectValue<M, O>> & {
           readonly event: E;
         }
       >
     : never; */

export type DataSelectEventChangeParams<
  E extends SelectEvent,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = E extends SelectEvent
  ? Prettify<
      SelectEventChangeParams<E, InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>> &
        EventItemParam<E>
    >
  : never;

export type SelectChangeHandler<V extends AllowedSelectValue, B extends SelectBehaviorType> = {
  <E extends SelectEvent>(value: SelectValue<V, B>, params: SelectEventChangeParams<E, V>): void;
};

export type SelectEventChangeHandler<
  E extends SelectEvent,
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
  P = SelectEventChangeParams<E, V>,
> = {
  (value: SelectValue<V, B>, params: P): void;
};

export type DataSelectBaseChangeHandler<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = {
  <E extends SelectEvent>(
    value: DataSelectValue<M, O>,
    modelValue: DataSelectModelValue<M, O>,
    params: DataSelectBaseEventChangeParams<E, M, O>,
  ): void;
};

export type DataSelectBaseEventChangeHandler<
  E extends SelectEvent,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (
  value: DataSelectValue<M, O>,
  modelValue: DataSelectModelValue<M, O>,
  params: DataSelectBaseEventChangeParams<E, M, O>,
) => void;

export type DataSelectChangeHandler<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  <E extends SelectEvent>(
    value: DataSelectValue<M, O>,
    modelValue: DataSelectModelValue<M, O>,
    params: DataSelectEventChangeParams<E, M, O>,
  ): void;
};

export type DataSelectEventChangeHandler<
  E extends SelectEvent,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (
  value: DataSelectValue<M, O>,
  modelValue: DataSelectModelValue<M, O>,
  params: SelectEventChangeParams<E, InferredDataSelectValue<M, O>>,
) => void;

/* ------------------------------ Select Instances ------------------------------ */
type SelectEventActionFn<
  E extends SelectEvent,
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
  P extends SelectEventPublicArgs = SelectEventPublicArgs,
> = (value: V, p?: P, cb?: SelectEventChangeHandler<E, V, B>) => void;

interface AbstractManagedSelect<V extends AllowedSelectValue, B extends SelectBehaviorType> {}

export interface ManagedSelect<V extends AllowedSelectValue, B extends SelectBehaviorType> {
  readonly value: SelectNullableValue<V, B> | NotSet;
  /**
   * Sets the value of the select directly.  This method can be used to manipulate the value of
   * the select directly, but is mostly intended for purposes internal to the Select component
   * and its variations.
   *
   * The method will not cause the 'onChange' handler to fire.
   */
  readonly setValue: (
    value: SelectValue<V, B>,
    options?: { __private_ignore_controlled_state__: boolean },
  ) => void;
  readonly isSelected: (v: V) => boolean;
  /**
   * Clears the value of the Select. This method can be used to manipulate the value of the Select
   * directly. By default, the method will cause the 'onChange' handler to fire - but if that is not
   * desired, the 'dispatchChangeEvent' option can be set to false.
   */
  readonly clear: IfClearable<
    B,
    (
      p?: SelectEventPublicArgs,
      cb?: SelectEventChangeHandler<typeof SelectEvents.CLEAR, V, B>,
    ) => void
  >;
  /**
   * Deselects the item associated with the value {@link V} in the Select.  This method can be used
   * to manipulate the value of the Select directly.  By default, the method will cause the
   * 'onChange' handler to fire - but if that is not desired, the 'dispatchChangeEvent' option
   * can be set to false.
   *
   * If the 'dispatchChangeEvent' option is not set to false, the method will require that the
   * {@link MenuItemInstance} is included in the option parameters it accepts.
   */
  readonly deselect: IfDeselectable<
    B,
    SelectEventActionFn<typeof SelectEvents.DESELECT, V, B>,
    never
  >;
  /**
   * Selects the item associated with the value {@link V} in the Select.  This method can be used
   * to manipulate the value of the Select directly.  By default, the method will cause the
   * 'onChange' handler to fire - but if that is not desired, the 'dispatchChangeEvent' option
   * can be set to false.
   *
   * If the 'dispatchChangeEvent' option is not set to false, the method will require that the
   * {@link MenuItemInstance} is included in the option parameters it accepts.
   */
  readonly select: SelectEventActionFn<typeof SelectEvents.SELECT, V, B>;
  /**
   * Toggles the selection state of the item associated with the value {@link V} in the Select. This
   * method can be used to manipulate the value of the Select directly.  By default, the method will
   * cause the 'onChange' handler to fire - but if that is not desired, the 'dispatchChangeEvent'
   * option can be set to false.
   *
   * If the 'dispatchChangeEvent' option is not set to false, the method will require that the
   * {@link MenuItemInstance} is included in the option parameters it accepts.
   */
  readonly toggle: SelectEventActionFn<
    typeof SelectEvents.DESELECT | typeof SelectEvents.SELECT,
    V,
    B
  >;
}

type DataSelectEventActionFn<
  E extends SelectEvent,
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  P extends SelectEventPublicArgs = SelectEventPublicArgs,
> = (
  value: M | InferredDataSelectValue<M, O>,
  p?: P,
  cb?: DataSelectBaseEventChangeHandler<E, M, O>,
) => void;

export interface ManagedDataSelect<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  MV extends DataSelectNullableModelValue<M, O> | NotSet = DataSelectNullableModelValue<M, O>,
> extends Omit<
    ManagedSelect<InferredDataSelectValue<M, O>, InferredDataSelectBehavior<M, O>>,
    "select" | "deselect" | "toggle" | "clear" | "isSelected"
  > {
  readonly modelValue: MV;
  readonly clear: IfDataSelectClearable<
    M,
    O,
    (
      p: SelectEventPublicArgs,
      cb?: DataSelectEventChangeHandler<typeof SelectEvents.CLEAR, M, O>,
    ) => void
  >;
  readonly deselect: IfDataSelectDeselectable<
    M,
    O,
    DataSelectEventActionFn<typeof SelectEvents.DESELECT, M, O>
  >;
  readonly toggle: DataSelectEventActionFn<
    typeof SelectEvents.SELECT | typeof SelectEvents.DESELECT,
    M,
    O
  >;
  readonly select: DataSelectEventActionFn<
    typeof SelectEvents.SELECT,
    M,
    O,
    SelectEventPublicArgs & { readonly optimisticModels?: M[] }
  >;
  readonly isSelected: (m: M | InferredDataSelectValue<M, O>) => boolean;
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
  Omit<ManagedSelect<V, B>, "value"> & {
    readonly setValue: (v: SelectValue<V, B>) => void;
    readonly setLoading: (v: boolean) => void;
  };

export type AddOptimisticModelParams =
  | {
      readonly dispatchChangeEvent?: false;
      readonly select?: false;
    }
  | {
      readonly dispatchChangeEvent?: boolean;
      readonly select: true;
    };

export type AddOptimisticModel<M extends DataSelectModel> = (
  m: M | ((curr: M[]) => [M, M[]]),
  params: AddOptimisticModelParams,
) => void;

export interface DataSelectBaseInstance<M extends DataSelectModel, O extends DataSelectOptions<M>>
  extends RootSelectInstance,
    Pick<
      ManagedDataSelect<M, O>,
      "clear" | "deselect" | "select" | "toggle" | "isSelected" | "setValue"
    > {}

export type DataSelectMenuOptions<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly getModelId: (m: M) => InferredDataSelectValue<M, O>;
};

export interface DataSelectInstance<M extends DataSelectModel, O extends DataSelectOptions<M>>
  extends DataSelectBaseInstance<M, O> {
  readonly getMenuItemInstance: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => MenuItemInstance | null;
  readonly getOrCreateMenuItemInstance: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => MenuItemInstance;
  readonly createMenuItemInstanceIfNecessary: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => DisconnectedMenuItemInstance | null;
  readonly createMenuItemInstance: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  readonly setContentLoading: (v: boolean) => void;
  readonly addOptimisticModel: AddOptimisticModel<M>;
  readonly setLoading: (v: boolean) => void;
}

/* ------------------------------ Select Custom Items ------------------------------ */
export type DataSelectCustomItemRenderer<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (instance: MenuItemInstance, select: DataSelectInstance<M, O>) => JSX.Element;

export type DataSelectCustomMenuItem<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = Omit<DataMenuCustomModel, "onClick"> & {
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

/* ------------------------------ Select Value Renderers ------------------------------ */
export type SelectValueRenderer<V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<V, B>,
  select: SelectInstance<V, B>,
) => ReactNode;

export type DataSelectValueRenderer<M extends DataSelectModel, O extends DataSelectOptions<M>> = (
  value: DataSelectValue<M, O>,
  modelValue: DataSelectModelValue<M, O>,
  select: DataSelectInstance<M, O>,
) => ReactNode;
