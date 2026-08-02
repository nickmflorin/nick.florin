import { type JSX, type ReactNode } from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type Prettify } from '~/lib/types';

import {
  type ConnectedMenuItemInstance,
  type CreateDataMenuItemInstanceOptions,
  type CreateDataMenuItemInstanceRT,
  type DataMenuCustomModel,
  dataMenuCustomModelIsObj,
  type DataMenuItemInstanceLookupArg,
  type DataMenuModel,
  type DataMenuOptions,
  type DisconnectedMenuItemInstance,
  type MenuItemClickEvent,
  type MenuItemInstance,
} from '~/components/menus';

export const NOTSET = '__NOTSET__' as const;
export type NotSet = typeof NOTSET;

export const DONOTHING = '__DONOTHING__' as const;
export type DoNothing = typeof DONOTHING;

export const SelectEvents = enumeratedLiterals(['select', 'deselect', 'clear'] as const, {});
export type SelectEvent = EnumeratedLiteralsMember<typeof SelectEvents>;

/**
 * Represents the primitives that are allowed to represent the value of individual items in a
 * Select.
 */
export type AllowedSelectValue = number | string;

/* ------------------------------ Select Behaviors ------------------------------ */
export const SelectBehaviorTypes = enumeratedLiterals(
  ['multi', 'single-nullable', 'single'] as const,
  {},
);
export type SelectBehaviorType = EnumeratedLiteralsMember<typeof SelectBehaviorTypes>;

/* ------------------------------ Select Args ------------------------------ */
type SelectArg = {
  readonly behavior: SelectBehaviorType;
  readonly model?: never;
  readonly options?: never;
  readonly value: AllowedSelectValue;
};

type DataSelectArg<
  M extends DataSelectModel = DataSelectModel,
  O extends DataSelectOptions<M> = DataSelectOptions<M>,
> = {
  readonly behavior?: never;
  readonly model: M;
  readonly options: O;
  readonly value?: never;
};

/**
 * Defines the various ways in which the type-specific properties of the Select and/or DataSelect
 * can be inferred.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type SelectArgs<M extends DataSelectModel = any> = DataSelectArg<M> | SelectArg;

export const argsHaveModel = <M extends DataSelectModel>(
  args: Pick<SelectArgs<M>, 'model'>,
): args is Pick<DataSelectArg<M>, 'model'> => args.model !== undefined;

export const argsHaveBehavior = <M extends DataSelectModel>(
  args: Pick<SelectArgs<M>, 'behavior'>,
): args is Pick<SelectArg, 'behavior'> => args.behavior !== undefined;

export const argsHaveValue = <M extends DataSelectModel>(
  args: Pick<SelectArgs<M>, 'value'>,
): args is Pick<SelectArg, 'value'> => args.value !== undefined;

export const argsHaveOptions = <M extends DataSelectModel>(
  args: Pick<SelectArgs<M>, 'options'>,
): args is Pick<DataSelectArg<M>, 'options'> => args.options !== undefined;

export type InferM<Args extends SelectArgs> = Args extends {
  readonly model: infer M extends DataSelectModel;
}
  ? M
  : never;

export type InferO<Args extends SelectArgs> = Args extends {
  readonly model: infer M extends DataSelectModel;
  readonly options: infer O;
}
  ? O extends DataSelectOptions<M>
    ? O
    : never
  : never;

export type InferV<Args extends Pick<SelectArgs, 'model' | 'options' | 'value'>> = Args extends {
  readonly value: infer V extends AllowedSelectValue;
}
  ? V
  : Args extends { model: infer M extends DataSelectModel; options: infer O }
    ? O extends { getModelValue: (m: M) => infer V extends AllowedSelectValue }
      ? V
      : M extends DataSelectModel<infer V extends AllowedSelectValue>
        ? V
        : never
    : never;

export type InferB<Args extends Pick<SelectArgs, 'behavior' | 'options'>> = Args extends {
  readonly behavior: infer B extends SelectBehaviorType;
}
  ? B
  : Args extends { options: infer O }
    ? O extends { behavior: infer B extends SelectBehaviorType }
      ? B
      : never
    : never;

export const selectBehavior = <Args extends Pick<SelectArgs, 'behavior' | 'options'>>(
  args: Args,
): InferB<Args> => (argsHaveOptions(args) ? args.options.behavior : args.behavior) as InferB<Args>;

export type IfSingleNullable<
  B extends SelectBehaviorType,
  T,
  F = never,
> = B extends 'single-nullable' ? T : F;

export type IfMulti<B extends SelectBehaviorType, T, F = never> = B extends 'multi' ? T : F;

export type IfSingle<B extends SelectBehaviorType, T, F = never> = B extends 'single' ? T : F;

type _IfDeselectable<B extends SelectBehaviorType, T, F = never> = B extends
  'multi' | 'single-nullable'
  ? T
  : F;

export type IfDeselectable<
  Args extends Pick<SelectArgs, 'behavior' | 'options'>,
  T,
  F = never,
> = _IfDeselectable<InferB<Args>, T, F>;

type _IfClearable<B extends SelectBehaviorType, T, F = never> = B extends
  'multi' | 'single-nullable'
  ? T
  : F;

export type IfClearable<
  Args extends Pick<SelectArgs, 'behavior' | 'options'>,
  T,
  F = never,
> = _IfClearable<InferB<Args>, T, F>;

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

export const isClearable = (behavior: SelectBehaviorType): behavior is ClearableSelectBehavior =>
  CLEARABLE_BEHAVIORS.includes(behavior as ClearableSelectBehavior);

export const ifDeselectable = <T, Args extends Pick<SelectArgs, 'behavior' | 'options'>>(
  value: T,
  args: Args,
): IfDeselectable<Args, T> =>
  (isDeselectable(selectBehavior(args)) ? value : undefined) as IfDeselectable<Args, T>;

export const ifClearable = <T, Args extends Pick<SelectArgs, 'behavior' | 'options'>>(
  value: T,
  args: Args,
): IfClearable<Args, T> =>
  (isClearable(selectBehavior(args)) ? value : undefined) as IfClearable<Args, T>;

/* ------------------------------ Select Modeling ------------------------------ */
type _SelectNullableValue<
  V extends AllowedSelectValue,
  B extends SelectBehaviorType,
> = B extends 'multi'
  ? V[]
  : B extends 'single-nullable'
    ? null | V
    : B extends 'single'
      ? null | V
      : never;

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
export type SelectNullableValue<Args extends SelectArgs> = _SelectNullableValue<
  InferV<Args>,
  InferB<Args>
>;

type _SelectValue<V extends AllowedSelectValue, B extends SelectBehaviorType> = B extends 'multi'
  ? V[]
  : B extends 'single-nullable'
    ? null | V
    : B extends 'single'
      ? V
      : never;

/**
 * Represents the value that a Select exhibits.  The form of this value depends on the behavior
 * of the Select, {@link SelectBehaviorType}.
 */
export type SelectValue<Args extends SelectArgs> = _SelectValue<InferV<Args>, InferB<Args>>;

export type DataSelectOptions<
  M extends DataSelectModel,
  B extends SelectBehaviorType = SelectBehaviorType,
> = {
  readonly behavior: B;
  readonly getModelValue?: (model: M) => AllowedSelectValue;
} & Omit<DataMenuOptions<M>, 'getRefKey'>;

export interface DataSelectModel<V extends AllowedSelectValue = AllowedSelectValue> extends Omit<
  DataMenuModel,
  'refKey'
> {
  readonly refKey?: never;
  readonly value?: V;
  /**
   * The element that is used to communicate the value of the select in the select input.
   */
  readonly valueLabel?: ReactNode;
}

export type ConnectedDataSelectModel<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly onClick?: (
    e: MenuItemClickEvent,
    instance: ConnectedMenuItemInstance,
    select: DataSelectInstance<M, O>,
  ) => void;
} & M;

/**
 * Represents the model {@link M} or models {@link M[]} that are associated with the value that a
 * DataSelect exhibits.  The form of this value depends on the behavior of the Select,
 * {@link SelectBehaviorType}.
 */
export type DataSelectModelValue<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = O extends { behavior: 'multi' }
  ? M[]
  : O extends { behavior: 'single-nullable' }
    ? M | null
    : O extends { behavior: 'single' }
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
> = O extends { behavior: 'multi' }
  ? M[]
  : O extends { behavior: 'single-nullable' }
    ? M | null
    : O extends { behavior: 'single' }
      ? M | null
      : never;

/* ------------------------------ Select Change Handlers ------------------------------ */
export type SelectEventRecord<E extends SelectEvent, V extends AllowedSelectValue> = {
  readonly clear: {
    readonly deselected?: never;
    readonly selected?: never;
  };
  readonly deselect: {
    readonly deselected: V;
    readonly selected?: never;
  };
  readonly select: {
    readonly deselected?: never;
    readonly selected: V;
  };
}[E];

export type SelectEventPublicArgs = {
  readonly dispatchChangeEvent?: boolean;
};

type EventParamsIncludesDefault = { item?: false; modelValue?: false };

type EventParamsIncludes =
  | { item: true; modelValue: true }
  | { item?: false; modelValue: true }
  | EventParamsIncludesDefault;

type EventItemParam<E extends SelectEvent> = E extends SelectEvent
  ? {
      clear: { readonly item?: never };
      deselect: { readonly item: MenuItemInstance };
      select: { readonly item: MenuItemInstance };
    }[E]
  : never;

type _SelectChangeEventParams<E extends SelectEvent, Args extends SelectArgs> = Prettify<
  {
    readonly event: E;
    readonly modelValue: DataSelectModelValue<InferM<Args>, InferO<Args>>;
  } & EventItemParam<E> &
    SelectEventRecord<E, InferV<Args>>
>;

type TruthyKeys<K extends Partial<Record<string, boolean | undefined>>> = keyof {
  [key in keyof K as [K[key]] extends [true] ? key : never]: key;
};

/**
 * Represents the parameters that are provided to event handlers related to the Select and/or
 * DataSelect when a {@link SelectEvent} occurs.
 *
 * Dynamic Attributes
 * -------------------
 * The following attributes are dynamic, and not included in the resulting type by default.  They
 * can be included in the resulting type by including the generic type 'I' in the type definition.
 *
 * 1. 'modelValue' - Represents the model value associated with the value of a DataSelect. This is
 *    only applicable for the DataSelect. See {@link DataSelectModelValue}.
 * 2. 'instance' - Represents the {@link MenuItemInstance} associated with the MenuItem that may
 *    have been selected/deselected. This is only applicable for the DataSelect.
 *
 * The ability to dynamically include/exclude both of these attributes in the resulting type gives
 * this type enough flexibility to be consistently used across the various contexts of the Select
 * related components and hooks.
 *
 * Instance Attribute
 * -----------------
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
export type SelectChangeEventParams<
  E extends SelectEvent,
  Args extends SelectArgs,
  I extends EventParamsIncludes = EventParamsIncludesDefault,
> = E extends SelectEvent
  ? Pick<_SelectChangeEventParams<E, Args>, 'deselected' | 'event' | 'selected' | TruthyKeys<I>>
  : never;

export type SelectChangeHandler<
  Args extends SelectArgs,
  I extends EventParamsIncludes = EventParamsIncludesDefault,
> = <E extends SelectEvent>(
  value: SelectValue<Args>,
  params: SelectChangeEventParams<E, Args, I>,
) => void;

export type SelectEventChangeHandler<
  E extends SelectEvent,
  Args extends SelectArgs,
  I extends EventParamsIncludes = EventParamsIncludesDefault,
> = (value: SelectValue<Args>, params: SelectChangeEventParams<E, Args, I>) => void;

/* ------------------------------ Select Instances ------------------------------ */
type SelectEventActionFn<
  E extends SelectEvent,
  Args extends SelectArgs,
  I extends EventParamsIncludes = EventParamsIncludesDefault,
  P extends SelectEventPublicArgs = SelectEventPublicArgs,
> = (value: InferM<Args> | InferV<Args>, p?: P, cb?: SelectEventChangeHandler<E, Args, I>) => void;

export interface ManagedSelect<V extends AllowedSelectValue, B extends SelectBehaviorType> {
  /**
   * Clears the value of the Select. This method can be used to manipulate the value of the Select
   * directly. By default, the method will cause the 'onChange' handler to fire - but if that is not
   * desired, the 'dispatchChangeEvent' option can be set to false.
   */
  readonly clear: IfClearable<
    { behavior: B; value: V },
    (
      p?: SelectEventPublicArgs,
      cb?: SelectEventChangeHandler<typeof SelectEvents.CLEAR, { behavior: B; value: V }>,
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
    { behavior: B; value: V },
    SelectEventActionFn<typeof SelectEvents.DESELECT, { behavior: B; value: V }>,
    never
  >;
  readonly isSelected: (v: V) => boolean;
  /**
   * Selects the item associated with the value {@link V} in the Select.  This method can be used
   * to manipulate the value of the Select directly.  By default, the method will cause the
   * 'onChange' handler to fire - but if that is not desired, the 'dispatchChangeEvent' option
   * can be set to false.
   *
   * If the 'dispatchChangeEvent' option is not set to false, the method will require that the
   * {@link MenuItemInstance} is included in the option parameters it accepts.
   */
  readonly select: SelectEventActionFn<typeof SelectEvents.SELECT, { behavior: B; value: V }>;
  /**
   * Sets the value of the select directly.  This method can be used to manipulate the value of
   * the select directly, but is mostly intended for purposes internal to the Select component
   * and its variations.
   *
   * The method will not cause the 'onChange' handler to fire.
   */
  readonly setValue: (
    value: SelectValue<{ behavior: B; value: V }>,
    options?: { __private_ignore_controlled_state__: boolean },
  ) => void;
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
    { behavior: B; value: V }
  >;
  readonly value: NotSet | SelectNullableValue<{ behavior: B; value: V }>;
}

export interface ManagedDataSelect<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
  MV extends DataSelectNullableModelValue<M, O> | NotSet = DataSelectNullableModelValue<M, O>,
> extends Pick<
  ManagedSelect<InferV<{ model: M; options: O }>, InferB<{ model: M; options: O }>>,
  'setValue' | 'value'
> {
  readonly clear: IfClearable<
    { model: M; options: O },
    (
      p?: SelectEventPublicArgs,
      cb?: SelectEventChangeHandler<
        typeof SelectEvents.CLEAR,
        { model: M; options: O },
        { modelValue: true }
      >,
    ) => void
  >;
  readonly deselect: IfDeselectable<
    { model: M; options: O },
    SelectEventActionFn<
      typeof SelectEvents.DESELECT,
      { model: M; options: O },
      { modelValue: true }
    >
  >;
  readonly isSelected: (m: InferV<{ model: M; options: O }> | M) => boolean;
  readonly modelValue: MV;
  readonly select: SelectEventActionFn<
    typeof SelectEvents.SELECT,
    { model: M; options: O },
    { modelValue: true },
    { readonly optimisticModels?: M[] } & SelectEventPublicArgs
  >;
  readonly toggle: SelectEventActionFn<
    typeof SelectEvents.DESELECT | typeof SelectEvents.SELECT,
    { model: M; options: O },
    { modelValue: true }
  >;
}

export type RootSelectInstance = {
  readonly focusInput: () => void;
  readonly setInputLoading: (v: boolean) => void;
  readonly setOpen: (v: boolean) => void;
  readonly setPopoverLoading: (v: boolean) => void;
};

export type SelectInstance<V extends AllowedSelectValue, B extends SelectBehaviorType> = {
  readonly setLoading: (v: boolean) => void;
  readonly setValue: (v: SelectValue<{ behavior: B; value: V }>) => void;
} & Omit<ManagedSelect<V, B>, 'value'> &
  RootSelectInstance;

export type AddOptimisticModelParams =
  | {
      readonly dispatchChangeEvent?: boolean;
      readonly select: true;
    }
  | {
      readonly dispatchChangeEvent?: false;
      readonly select?: false;
    };

export type AddOptimisticModel<M extends DataSelectModel> = (
  m: ((curr: M[]) => [M, M[]]) | M,
  params: AddOptimisticModelParams,
) => void;

export interface DataSelectBaseInstance<M extends DataSelectModel, O extends DataSelectOptions<M>>
  extends
    RootSelectInstance,
    Pick<
      ManagedDataSelect<M, O>,
      'clear' | 'deselect' | 'isSelected' | 'select' | 'setValue' | 'toggle'
    > {}

export type DataSelectMenuOptions<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly getModelId: (m: M) => InferV<{ model: M; options: O }>;
};

export interface DataSelectInstance<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> extends DataSelectBaseInstance<M, O> {
  /**
   * Adds a model, {@link M}, to the data stored in state that the DataSelect uses to render the
   * content in the popover.  This method can be used when applying optimistic updates to the
   * population of models, {@link M[]}, that may have been previously fetched from an API request.
   */
  readonly addOptimisticModel: AddOptimisticModel<M>;
  /**
   * Creates a {@link MenuItemInstance} associated with the provided value or model.
   */
  readonly createMenuItemInstance: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  /**
   * Creates a {@link MenuItemInstance} associated with the provided value or model only if
   * the {@link MenuItemInstance} has not yet been created.
   */
  readonly createMenuItemInstanceIfNecessary: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => DisconnectedMenuItemInstance | null;
  /**
   * Retrieves the {@link MenuItemInstance} associated with the rendered or unrendered MenuItem
   * who's content is related to the with the provided value or model,
   * {@link DataMenuItemInstanceLookupArg}.
   *
   * If the MenuItem associated with the provided value or model,
   * {@link DataMenuItemInstanceLookupArg}, is not yet rendered in the UI, the method will return
   * an instance of type {@link DisconnectedMenuItemInstance}.  If the MenuItem associated with
   * the provided value or model is rendered in the UI, the method wil return an instance of type
   * {@link ConnectedMenuItemInstance}.
   *
   * If the {@link MenuItemInstance} has not yet been created, the method will return null.
   */
  readonly getMenuItemInstance: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => MenuItemInstance | null;
  /**
   * Retrieves the {@link MenuItemInstance} associated with the rendered or unrendered MenuItem
   * who's content is related to the with the provided value or model,
   * {@link DataMenuItemInstanceLookupArg}.  If the {@link MenuItemInstance} has not yet been
   * created, the method will create the {@link MenuItemInstance} and return it.
   */
  readonly getOrCreateMenuItemInstance: (
    m: DataMenuItemInstanceLookupArg<M, DataSelectMenuOptions<M, O>>,
  ) => MenuItemInstance;
  /**
   * Sets the loading state of the DataSelect's DataMenu's content.  When in a loading state, the
   * DataMenu's content will show a loading indicator.
   */
  readonly setContentLoading: (v: boolean) => void;
  /**
   * Sets the loading state of the DataSelect as a whole.  When in a loading state, the DataSelect
   * will treat both the DataMenu's content and the DataSelectInput as being in loading states,
   * each of which will show loading indicators.
   */
  readonly setLoading: (v: boolean) => void;
}

/* ------------------------------ Select Custom Items ------------------------------ */
export type DataSelectCustomItemRenderer<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (instance: MenuItemInstance, select: DataSelectInstance<M, O>) => JSX.Element;

type DataSelectCustomModelItemClickHandler<
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
> = (e: MenuItemClickEvent, instance: MenuItemInstance, select: DataSelectInstance<M, O>) => void;

export type DataSelectCustomMenuItem<M extends DataSelectModel, O extends DataSelectOptions<M>> = {
  readonly renderer?: DataSelectCustomItemRenderer<M, O>;
} & DataMenuCustomModel<DataSelectCustomModelItemClickHandler<M, O>>;

export const dataSelectCustomItemIsObject = <
  M extends DataSelectModel,
  O extends DataSelectOptions<M>,
>(
  obj: JSX.Element | Omit<DataSelectCustomMenuItem<M, O>, 'isCustom'>,
): obj is Omit<DataSelectCustomMenuItem<M, O>, 'isCustom'> =>
  dataMenuCustomModelIsObj<
    Omit<DataSelectCustomMenuItem<M, O>, 'isCustom'>,
    DataSelectCustomModelItemClickHandler<M, O>
  >(obj);

/* ------------------------------ Select Value Renderers ------------------------------ */
export type SelectValueRenderer<V extends AllowedSelectValue, B extends SelectBehaviorType> = (
  value: SelectValue<{ behavior: B; value: V }>,
  select: SelectInstance<V, B>,
) => ReactNode;

export type DataSelectValueRenderer<M extends DataSelectModel, O extends DataSelectOptions<M>> = (
  value: SelectValue<{ model: M; options: O }>,
  modelValue: DataSelectModelValue<M, O>,
  select: DataSelectInstance<M, O>,
) => ReactNode;
