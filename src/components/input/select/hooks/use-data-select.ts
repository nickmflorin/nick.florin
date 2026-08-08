import { useCallback, useEffect, useState } from 'react';

import { isEqual, uniqBy } from 'lodash-es';

import { UnreachableCaseError } from '~/application/errors';
import { logger } from '~/internal/logger';

import * as types from '~/components/input/select/types';

import { useDataSelectOptions } from './use-data-select-options';
import { useSelect, type UseSelectParams } from './use-select';

export interface UseDataSelectParams<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<
  UseSelectParams<types.InferV<{ model: M; options: O }>, types.InferB<{ model: M; options: O }>>,
  'behavior' | 'onChange'
> {
  readonly data: M[];
  readonly hasStrictValueLookup?: boolean;
  readonly isReady?: boolean;
  readonly onChange?: <E extends types.SelectEvent>(
    value: types.SelectValue<{ model: M; options: O }>,
    params: types.SelectChangeEventParams<E, { model: M; options: O }, { modelValue: true }>,
  ) => void;
  readonly options: O;
}

/**
 * Logs that no model could be found in the Select's data for the given initial value.
 *
 * This can occur if there is no model associated with the value in the Select's data, which can
 * happen if the 'isReady' flag is not initially set to 'false' for asynchronously loaded data.
 *
 * @param {unknown} value The value that could not be matched to a model.
 */
const logMissingInitialModelError = (value: unknown) =>
  logger.error(
    `Could not find a model associated with select's initial value '${String(value)}' in the ` +
      'data. This may lead to buggy behavior.',
  );

const getInitialModelValue = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  getModel,
  options,
  value,
}: {
  readonly getModel: (v: types.InferV<{ model: M; options: O }>) => M | null;
  readonly value: types.SelectNullableValue<{ model: M; options: O }>;
} & Pick<UseDataSelectParams<M, O>, 'options'>): types.DataSelectNullableModelValue<M, O> => {
  const v = value as
    null | types.InferV<{ model: M; options: O }> | types.InferV<{ model: M; options: O }>[];
  if (Array.isArray(v)) {
    if (options.behavior !== types.SelectBehaviorTypes.MULTI) {
      throw new Error('Encountered an iterable value for a single select!');
    }
    return v.reduce((prev, vi) => {
      const m = getModel(vi);
      if (m !== null) {
        return [...prev, m];
      }
      logMissingInitialModelError(vi);
      return prev;
    }, [] as M[]) as types.DataSelectModelValue<M, O>;
  } else if (v !== null) {
    if (
      options.behavior !== types.SelectBehaviorTypes.SINGLE &&
      options.behavior !== types.SelectBehaviorTypes.SINGLE_NULLABLE
    ) {
      throw new Error('Encountered a non-iterable value for a multi-select!');
    }
    const m = getModel(v);
    if (m === null) {
      if (options.behavior === types.SelectBehaviorTypes.SINGLE_NULLABLE) {
        logMissingInitialModelError(value);
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      throw new Error("The select's initial value is not associated with any model in the data!");
    }
    return m as types.DataSelectNullableModelValue<M, O>;
  }
  return null as types.DataSelectNullableModelValue<M, O>;
};

const getModel = <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
  v: types.InferV<{ model: M; options: O }>,
  {
    data,
    getModelValue,
    hasStrictValueLookup,
  }: {
    data: M[];
    getModelValue: (m: M) => types.InferV<{ model: M; options: O }>;
    hasStrictValueLookup: boolean;
  },
): M | null => {
  const ms = data.filter(m => isEqual(getModelValue(m), v));
  if (ms.length === 0) {
    if (hasStrictValueLookup) {
      throw new Error(
        `The value, '${v}', does not match any of the models in the data. ` +
          "Did you forget to set the 'isReady' flag to false, until the data has been loaded?",
      );
    }
    logger.warn(
      `The value, '${v}', does not match any of the models in the data. ` +
        "Did you forget to set the 'isReady' flag to false, until the data has been loaded?",
    );
    return null;
  } else if (ms.length > 1) {
    logger.error(
      `The value, '${v}', points to multiple models in the Select's data.  This is ` +
        'likely a bug, and will lead to unexpected behavior.',
      { v },
    );
  }
  return ms[0];
};

const reduceModelValue = <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
  curr: types.DataSelectNullableModelValue<M, O>,
  value: types.SelectNullableValue<{ model: M; options: O }>,
  {
    data,
    getModelValue,
    hasStrictValueLookup,
    options,
  }: {
    data: M[];
    getModelValue: (m: M) => types.InferV<{ model: M; options: O }>;
    hasStrictValueLookup: boolean;
    options: O;
  },
): types.DataSelectNullableModelValue<M, O> | types.DoNothing => {
  // Distribute/flatten the conditional type to a union of its potential values.
  const selectValue = value as
    null | types.InferV<{ model: M; options: O }> | types.InferV<{ model: M; options: O }>[];

  // Distribute/flatten the conditional type to a union of its potential values.
  const existing = curr as M | M[] | null | types.NotSet;

  switch (options.behavior) {
    case types.SelectBehaviorTypes.MULTI: {
      if (!Array.isArray(selectValue)) {
        logger.error(
          'Corrupted State: Detected non-array state value for multi-select! ' +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        return types.DONOTHING;
      } else if (!Array.isArray(curr)) {
        logger.error(
          'Corrupted State: Detected non-array state model value for multi-select! ' +
            "The select's behavior may be compromised.",
          { curr },
        );
        return types.DONOTHING;
      }
      let validValueElements: types.InferV<{ model: M; options: O }>[] = [];
      const modelValue = selectValue.reduce((prev, vi) => {
        const m = getModel(vi, {
          data: uniqBy([...data, ...curr], datum => getModelValue(datum)),
          getModelValue,
          hasStrictValueLookup,
        });
        /* The model, 'm', will be 'null' if the value does not match any of the models in the data
           and 'hasStrictValueLookup' is not 'false'. */
        if (m !== null) {
          validValueElements = [...validValueElements, vi];
          return [...prev, m];
        }
        return prev;
      }, [] as M[]) as types.DataSelectModelValue<M, O>;
      if (validValueElements.length !== selectValue.length) {
        return types.DONOTHING;
      }
      return modelValue;
    }
    case types.SelectBehaviorTypes.SINGLE: {
      /* Each corrupted-state branch below returns DONOTHING rather than resetting to null,
         because the select is not nullable; ignoring the change is the only available
         recourse. */
      if (Array.isArray(selectValue)) {
        logger.error(
          'Corrupted State: Detected an array state value for a single-select! ' +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        return types.DONOTHING;
      } else if (existing === types.NOTSET) {
        logger.error(
          'Corrupted State: Detected an unset model value for an initialized select!' +
            "The select's model value should be set if the select has been initialized.",
          { existing },
        );
        return types.DONOTHING;
      } else if (Array.isArray(existing)) {
        logger.error(
          'Corrupted State: Detected an array state model value for a single-select! ' +
            "The select's behavior may be compromised.",
          { existing },
        );
        return types.DONOTHING;
      } else if (selectValue === null) {
        /* Even though the select behavior is single, non-nullable, the initial value of the select
           can still be null if a selection has not yet been made.  This means that the model value
           must also be null. */
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      const m = getModel(selectValue, {
        data:
          existing === null
            ? uniqBy(data, datum => getModelValue(datum))
            : uniqBy([...data, existing], datum => getModelValue(datum)),
        getModelValue,
        hasStrictValueLookup,
      });
      /* If the model, 'm', cannot be found in the data - then our only form of recourse is to
         ignore the change. */
      if (m === null) {
        return types.DONOTHING;
      }
      return m as types.DataSelectModelValue<M, O>;
    }
    case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
      if (Array.isArray(selectValue)) {
        logger.error(
          'Corrupted State: Detected an array state value for a single-select! ' +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        return types.DONOTHING;
      } else if (existing === types.NOTSET) {
        logger.error(
          'Corrupted State: Detected an unset model value for an initialized select!' +
            "The select's model value should be set if the select has been initialized.",
          { existing },
        );
        return types.DONOTHING;
      } else if (Array.isArray(existing)) {
        logger.error(
          'Corrupted State: Detected an array state model value for a single-select! ' +
            "The select's behavior may be compromised.",
          { existing },
        );
        return types.DONOTHING;
      } else if (selectValue === null) {
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      const model = getModel(selectValue, {
        data: existing ? uniqBy([...data, existing], m => getModelValue(m)) : data,
        getModelValue,
        hasStrictValueLookup,
      });
      if (!model) {
        return types.DONOTHING;
      }
      return model as types.DataSelectModelValue<M, O>;
    }
    default:
      throw new UnreachableCaseError();
  }
};

/**
 * Throws because `onChange` should never be invoked from inside {@link useSelect}.
 *
 * The `onChange` callback is fired directly from inside of {@link useDataSelect} rather than being
 * passed through to {@link useSelect}, which would otherwise cause it to fire twice per change
 * event.
 */
const throwIfSelectOnChangeCalled = (): never => {
  throw new Error(
    "The 'onChange' callback should not be called from inside the 'useSelect' hook! " +
      'It is overridden and called directly in this hook instead.',
  );
};

/**
 * Passed to the underlying {@link useSelect} handlers so that they do not dispatch a change event
 * themselves; the change event is dispatched by the callback provided to those handlers instead.
 */
const SuppressUseSelectChangeEvent: types.SelectEventPublicArgs = { dispatchChangeEvent: false };

/**
 * A hook that is responsible for maintaining both the value of a Select component and the data
 * models associated with that value, {@link types.ConnectedDataSelectModel}, based on the behavior
 * of the Select, {@link SelectBehaviorType}, and the value-related props provided to the
 * Select.
 *
 * Background
 * ----------
 * Certain Select component(s) are built such that they can be provided with an array of data, or
 * models, each of which is associated with a value that is used to determine the overall value of
 * the Select when the menu items associated with those models are selected, deselected or cleared.
 *
 * The value of each model, or element in the array of data provided to the Select, can be defined
 * by either attributing the model with a `value` attribute or providing a `getModelValue` callback
 * prop to the Select.
 *
 * The overall value of the Select is managed by the `use-select-value` hook, which is responsible
 * for managing the value based on select, deselect and clear events.  However, it is also useful
 * to be aware of the model or models in the data that are associated with the Select's value, as
 * they can be included in callback props and other logic to streamline the Select's mechanics and
 * improve type-safety of the Select's usage.
 *
 * For example, in the following code snippet, when the Select's value changes, we not only have
 * access to the updated value of the Select but also the models (or data) that are associated with
 * the Select's value:
 *
 * >>> const bills = useBills();
 * >>>
 * >>> return (
 * >>>   <DataSelect
 * >>>     data={bills}
 * >>>     getModelValue={(b: Bill) => b.id}
 * >>>     onChange={(value, bills) => ...}
 * >>>   />
 * >>> )
 * />
 *
 * In order for the Select to be aware of the models in the data that are associated with its
 * current value, they have to be maintained in state in parallel to the Select's management of its
 * overall value in state (which is done by the 'use-select-value' hook).
 *
 * What about Asynchronously Loaded Data?
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * When the Select's data is loaded asynchronously, and the value of the Select is controlled
 * (i.e. the 'value' prop is provided to the Select), the value of the Select may be defined before
 * the data that the value corresponds to is loaded.  For instance, in the following snippet,
 * the value of the Select is known before the data that the value corresponds to is received from
 * the API:
 *
 * >>> const bills = useBills();
 * >>>
 * >>> return (
 * >>>   <DataSelect
 * >>      value={[1, 2, 4]}
 * >>>     data={bills}
 * >>>     getModelValue={(b: Bill) => b.id}
 * >>>     onChange={(value, bills) => ...}
 * >>>   />
 * >>> )
 * />
 *
 * This means that the Select cannot determine what model or models the value corresponds to,
 * because it needs to make that determination by comparing the value or values of the models in
 * the provided data with the value of the Select (which is provided as a prop).  If the data
 * is an empty array, and the Select tries to find the model(s) in the data that correspond to its
 * value, nothing will be found - and an {@link Error} will be thrown.
 *
 * In these cases, to avoid an {@link Error} being thrown, the Select should be provided with the
 * 'isReady' prop - that is initially 'false' but then set to 'true' once the applicable data
 * has been loaded.  This will force the Select to wait until the data is available before trying
 * to determine what model or models in the data are associated with the Select's value.  The
 * Select will be in a disabled state until the 'isReady' flag is set to 'true' - preventing
 * select, deselect and clear events from changing the Select's value when it does not have the data
 * it needs to keep the value in sync with the set of models in state that are associated with that
 * value.
 *
 * What About Filtering/Searching?
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * If the data that the Select's is displaying is filtered or searched before it is provided to
 * the Select, it is possible (and likely) that the models that are associated with the Select's
 * value are filtered out of the data.  This means that the Select will not be able to determine
 * what model or models in the data are associated with the Select's value if a select or deselect
 * event occurs and the Select's value is updated accordingly.
 *
 * To avoid this, when the Select's value changes due to a select and/or deselect event, the
 * Select will update it's model value in state by looking up the model or models in both the data
 * that is currently present AND the models that are already maintained in state that are associated
 * with the Select's value just before the change occurred.  This way, since a select or deselect
 * event can only occur for a model that is currently visible in the Select's content, it is
 * guaranteed that the model will - at least for that short period of time - be in the combined set
 * of the visible models and the models that are already maintained in state.
 *
 * This is also why the 'modelValue' of the Select is managed in state, and updated in response to
 * changes to the Select's value, rather than being derived from the Select's value directly in a
 * 'useMemo' hook.
 */
export const useDataSelect = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  data,
  hasStrictValueLookup = true,
  isReady = true,
  onChange,
  onClear,
  onDeselect,
  onSelect,
  options,
  ...params
}: UseDataSelectParams<M, O>): types.ManagedDataSelect<
  M,
  O,
  types.DataSelectNullableModelValue<M, O> | types.NotSet
> => {
  const { getModelValue } = useDataSelectOptions<M, O>({ options });

  const {
    clear: _clear,
    deselect: _deselect,
    isSelected: _isSelected,
    select: _select,
    setValue: _setValue,
    toggle: _toggle,
    value,
    ...rest
  } = useSelect<types.InferV<{ model: M; options: O }>, O['behavior']>({
    ...params,
    behavior: options.behavior,
    isReady,
    onChange: throwIfSelectOnChangeCalled,
    onClear,
    onDeselect,
    onSelect,
  });

  const getInitializedModelValue = useCallback(
    (v: types.SelectNullableValue<{ model: M; options: O }>) =>
      getInitialModelValue({
        getModel: selectValue =>
          getModel(selectValue, { data, getModelValue, hasStrictValueLookup }),
        options,
        value: v,
      }),
    [data, hasStrictValueLookup, options, getModelValue],
  );

  const [modelValue, setModelValue] = useState<
    types.DataSelectNullableModelValue<M, O> | types.NotSet
  >(() => (isReady && value !== types.NOTSET ? getInitializedModelValue(value) : types.NOTSET));

  const setValue = useCallback(
    (v: types.SelectValue<{ model: M; options: O }>) => {
      const mv: types.DataSelectNullableModelValue<M, O> =
        modelValue === types.NOTSET ? getInitializedModelValue(v) : modelValue;

      const reduced = reduceModelValue(mv, v, {
        data,
        getModelValue,
        hasStrictValueLookup,
        options,
      });
      if (
        reduced === types.DONOTHING ||
        (reduced === null && options.behavior === types.SelectBehaviorTypes.SINGLE)
      ) {
        return;
      }
      /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
         internal, non-public prop. */
      _setValue(v, { __private_ignore_controlled_state__: true });
      setModelValue(reduced);
    },
    [
      modelValue,
      data,
      options,
      hasStrictValueLookup,
      getInitializedModelValue,
      _setValue,
      getModelValue,
    ],
  );

  /* Initializes the model value once both the readiness flag and the select's value are available.
     For asynchronously loaded data the two do not arrive together: the render that flips 'isReady'
     to 'true' still sees 'value' as NOTSET, because the value is set by an effect in 'useSelect'
     that commits in the same pass. Keying this effect on 'isReady' alone therefore left the model
     value stuck at NOTSET for the lifetime of the select, which disables it permanently. The
     NOTSET guard on the model value keeps this to initialization only, so a 'value' prop that is
     rebuilt on every render cannot drive a render loop through 'setValue'. */
  useEffect(() => {
    if (isReady && value !== types.NOTSET && modelValue === types.NOTSET) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- This is not a safe disable
         and this needs to be fixed! It is only being disabled to complete the ESLint migration for
         now. */
      setValue(value as types.SelectValue<{ model: M; options: O }>);
    }
    /* eslint-disable-next-line @eslint-react/exhaustive-deps -- 'setValue' is deliberately omitted:
       it is rebuilt whenever 'modelValue' changes, so including it would re-run this effect on its
       own result. This needs to be refactored in the future for better control of an uncontrolled
       vs. controlled Select value that doesn't rely on effects like this. */
  }, [isReady, value, modelValue]);

  const handleEvent = useCallback(
    <E extends types.SelectEvent>(
      updated: types.SelectValue<{ model: M; options: O }>,
      {
        data: _data,
        dispatchChangeEvent = true,
        ...eventParams
      }: {
        readonly data?: M[];
        readonly dispatchChangeEvent?: boolean;
      } & types.SelectChangeEventParams<E, { model: M; options: O }>,
      cb?: types.SelectEventChangeHandler<E, { model: M; options: O }, { modelValue: true }>,
    ) => {
      if (modelValue === types.NOTSET) {
        logger.error(
          'Detected a change event in the select when the model value has not yet been set!',
        );
        return;
      }
      const reduced = reduceModelValue(modelValue, updated, {
        data: _data ?? data,
        getModelValue,
        hasStrictValueLookup,
        options,
      });
      if (
        reduced === types.DONOTHING ||
        (reduced === null && options.behavior === types.SelectBehaviorTypes.SINGLE)
      ) {
        return;
      }
      setModelValue(reduced);
      const r = {
        ...eventParams,
        modelValue: reduced as types.DataSelectModelValue<M, O>,
      } as types.SelectChangeEventParams<E, { model: M; options: O }, { modelValue: true }>;
      cb?.(updated, r);
      if (dispatchChangeEvent) {
        /* This should only be called if the Select's model value is not "NOTSET" to begin with,
           because the Select will disable selection if it is not in a "ready" state. */
        onChange?.(updated, r);
      }
    },
    [data, modelValue, options, hasStrictValueLookup, getModelValue, onChange],
  );

  const deselect = useCallback(
    (
      v: M | types.InferV<{ model: M; options: O }>,
      p?: types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.DESELECT,
        { model: M; options: O },
        { modelValue: true }
      >,
    ) =>
      _deselect(
        typeof v === 'string' || typeof v === 'number' ? v : getModelValue(v as M),
        SuppressUseSelectChangeEvent,
        (updated, eventParams) => handleEvent(updated, { ...p, ...eventParams }, cb),
      ),
    [_deselect, handleEvent, getModelValue],
  );

  const select = useCallback(
    (
      v: M | types.InferV<{ model: M; options: O }>,
      p?: { readonly optimisticModels?: M[] } & types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.SELECT,
        { model: M; options: O },
        { modelValue: true }
      >,
    ) =>
      _select(
        typeof v === 'string' || typeof v === 'number' ? v : getModelValue(v as M),
        SuppressUseSelectChangeEvent,
        (updated, eventParams) =>
          handleEvent(
            updated,
            {
              ...eventParams,
              ...p,
              data: uniqBy([...data, ...(p?.optimisticModels ?? [])], getModelValue),
            },
            cb,
          ),
      ),
    [data, _select, handleEvent, getModelValue],
  );

  const clear = useCallback(
    (
      p?: types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.CLEAR,
        { model: M; options: O },
        { modelValue: true }
      >,
    ) =>
      _clear(SuppressUseSelectChangeEvent, (updated, eventParams) =>
        handleEvent(updated, { ...eventParams, ...p }, cb),
      ),
    [_clear, handleEvent],
  );

  const toggle = useCallback(
    (
      v: M | types.InferV<{ model: M; options: O }>,
      p?: types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.DESELECT | typeof types.SelectEvents.SELECT,
        { model: M; options: O },
        { modelValue: true }
      >,
    ) =>
      _toggle(
        typeof v === 'string' || typeof v === 'number' ? v : getModelValue(v as M),
        SuppressUseSelectChangeEvent,
        (updated, eventParams) => handleEvent(updated, { ...eventParams, ...p }, cb),
      ),
    [_toggle, handleEvent, getModelValue],
  );

  return {
    ...rest,
    clear: types.ifClearable(clear, { options }),
    deselect: types.ifDeselectable(deselect, { options }),
    isSelected: (v: M | types.InferV<{ model: M; options: O }>) =>
      _isSelected(typeof v === 'string' || typeof v === 'number' ? v : getModelValue(v as M)),
    modelValue,
    select,
    setValue,
    toggle,
    value,
  };
};
