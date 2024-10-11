import { useState, useEffect, useCallback } from "react";

import { isEqual, uniqBy } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/internal/logger";

import * as types from "~/components/input/select/types";

import { useDataSelectOptions } from "./use-data-select-options";
import { useSelect, type UseSelectParams } from "./use-select";

export interface UseDataSelectParams<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<
    UseSelectParams<types.InferredDataSelectValue<M, O>, types.InferredDataSelectBehavior<M, O>>,
    "onChange" | "behavior"
  > {
  readonly data: M[];
  readonly options: O;
  readonly isReady?: boolean;
  readonly strictValueLookup?: boolean;
  readonly onChange?: types.DataSelectBaseChangeHandler<M, O>;
}

const getInitialModelValue = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  options,
  value,
  getModel,
}: Pick<UseDataSelectParams<M, O>, "options"> & {
  readonly value: types.DataSelectNullableValue<M, O>;
  readonly getModel: (v: types.InferredDataSelectValue<M, O>) => M | null;
}): types.DataSelectNullableModelValue<M, O> => {
  const v = value as
    | types.InferredDataSelectValue<M, O>
    | null
    | types.InferredDataSelectValue<M, O>[];
  if (Array.isArray(v)) {
    if (options.behavior !== types.SelectBehaviorTypes.MULTI) {
      throw new Error("Encountered an iterable value for a single select!");
    }
    return v.reduce((prev, vi) => {
      const m = getModel(vi);
      if (m !== null) {
        return [...prev, m];
      }
      /* This can occur if there is no model associated with the value in the Select's data -
         which can happen if the 'isReady' flag is not initially set to 'false' for asynchronously
         loaded data. */
      logger.error(
        `Could not find a model associated with select's initial value '${vi}' in the data. ` +
          "This may lead to buggy behavior.",
      );
      return prev;
    }, [] as M[]) as types.DataSelectModelValue<M, O>;
  } else if (v !== null) {
    if (
      options.behavior !== types.SelectBehaviorTypes.SINGLE &&
      options.behavior !== types.SelectBehaviorTypes.SINGLE_NULLABLE
    ) {
      throw new Error("Encountered a non-iterable value for a multi-select!");
    }
    const m = getModel(v);
    if (m === null) {
      /* This can occur if there is no model associated with the value in the Select's data -
         which can happen if the 'isReady' flag is not initially set to 'false' for asynchronously
         loaded data. */
      if (options.behavior === types.SelectBehaviorTypes.SINGLE_NULLABLE) {
        logger.error(
          `Could not find a model associated with select's initial value '${value}' ` +
            "in the data. This may lead to buggy behavior.",
        );
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      throw new Error("The select's initial value is not associated with any model in the data!");
    }
    return m as types.DataSelectNullableModelValue<M, O>;
  }
  return null as types.DataSelectNullableModelValue<M, O>;
};

const getModel = <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
  v: types.InferredDataSelectValue<M, O>,
  {
    data,
    strictValueLookup,
    getItemValue,
  }: {
    strictValueLookup: boolean;
    getItemValue: (m: M) => types.InferredDataSelectValue<M, O>;
    data: M[];
  },
): M | null => {
  const ms = data.filter(m => isEqual(getItemValue(m), v));
  if (ms.length === 0) {
    if (strictValueLookup) {
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
        "likely a bug, and will lead to unexpected behavior.",
      { v },
    );
  }
  return ms[0];
};

const reduceModelValue = <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
  curr: types.DataSelectNullableModelValue<M, O>,
  value: types.DataSelectNullableValue<M, O>,
  {
    getItemValue,
    strictValueLookup,
    options,
    data,
  }: {
    strictValueLookup: boolean;
    getItemValue: (m: M) => types.InferredDataSelectValue<M, O>;
    options: O;
    data: M[];
  },
): types.DataSelectNullableModelValue<M, O> | types.DoNothing => {
  // Distribute/flatten the conditional type to a union of its potential values.
  const selectValue = value as
    | types.InferredDataSelectValue<M, O>
    | types.InferredDataSelectValue<M, O>[]
    | null;

  // Distribute/flatten the conditional type to a union of its potential values.
  const existing = curr as M | M[] | types.NotSet | null;

  switch (options.behavior) {
    case types.SelectBehaviorTypes.MULTI: {
      if (!Array.isArray(selectValue)) {
        logger.error(
          "Corrupted State: Detected non-array state value for multi-select! " +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        return types.DONOTHING;
      } else if (!Array.isArray(curr)) {
        logger.error(
          "Corrupted State: Detected non-array state model value for multi-select! " +
            "The select's behavior may be compromised.",
          { curr },
        );
        return types.DONOTHING;
      }
      /* Lookup the model in the combined set of models provided to the Select via the 'data'
         prop and the models corresponding to the previous Select's value that are already
         maintained in state.  This guarantees that the model can be found in the set in
         the case that the data provided to the Select is filtered.

         See the docstring on the hook for more information. */
      let validValueElements: types.InferredDataSelectValue<M, O>[] = [];
      const modelValue = selectValue.reduce((prev, vi) => {
        const m = getModel(vi, {
          strictValueLookup,
          data: uniqBy([...data, ...curr], m => getItemValue(m)),
          getItemValue,
        });
        /* The model, 'm', will be 'null' if the value does not match any of the models in the data
           and 'strictValueLookup' is not 'false'. */
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
      if (Array.isArray(selectValue)) {
        logger.error(
          "Corrupted State: Detected an array state value for a single-select! " +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        /* Here, we cannot reset the state to a null value because the select is not nullable.
           Our only form of recourse is to ignore the change. */
        return types.DONOTHING;
      } else if (existing === types.NOTSET) {
        logger.error(
          "Corrupted State: Detected an unset model value for an initialized select!" +
            "The select's model value should be set if the select has been initialized.",
          { existing },
        );
        /* Here, we cannot reset the state to a null value because the select is not nullable.
           Our only form of recourse is to ignore the change. */
        return types.DONOTHING;
      } else if (Array.isArray(existing)) {
        logger.error(
          "Corrupted State: Detected an array state model value for a single-select! " +
            "The select's behavior may be compromised.",
          { existing },
        );
        /* Here, we cannot reset the state to a null value because the select is not nullable.
           Our only form of recourse is to ignore the change. */
        return types.DONOTHING;
      } else if (selectValue === null) {
        /* Even though the select behavior is single, non-nullable, the initial value of the select
           can still be null if a selection has not yet been made.  This means that the model value
           must also be null. */
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      /* Lookup the model in the combined set of models provided to the Select via the 'data'
         prop and the models corresponding to the previous Select's value that are already
         maintained in state.  This guarantees that the model can be found in the set in
         the case that the data provided to the Select is filtered.

         See the docstring on the hook for more information. */
      const m = getModel(selectValue, {
        strictValueLookup,
        data:
          existing === null
            ? uniqBy(data, m => getItemValue(m))
            : uniqBy([...data, existing], m => getItemValue(m)),
        getItemValue,
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
          "Corrupted State: Detected an array state value for a single-select! " +
            "The select's behavior may be compromised.",
          { value: selectValue },
        );
        return types.DONOTHING;
      } else if (existing === types.NOTSET) {
        logger.error(
          "Corrupted State: Detected an unset model value for an initialized select!" +
            "The select's model value should be set if the select has been initialized.",
          { existing },
        );
        return types.DONOTHING;
      } else if (Array.isArray(existing)) {
        logger.error(
          "Corrupted State: Detected an array state model value for a single-select! " +
            "The select's behavior may be compromised.",
          { existing },
        );
        return types.DONOTHING;
      } else if (selectValue === null) {
        return null as types.DataSelectNullableModelValue<M, O>;
      }
      /* Lookup the model in the combined set of models provided to the Select via the 'data'
         prop and the models corresponding to the previous Select's value that are already
         maintained in state.  This guarantees that the model can be found in the set in
         the case that the data provided to the Select is filtered.

         See the docstring on the hook for more information. */
      const model = getModel(selectValue, {
        strictValueLookup,
        data: existing ? uniqBy([...data, existing], m => getItemValue(m)) : data,
        getItemValue,
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
 * by either attributing the model with a `value` attribute or providing a `getItemValue` callback
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
 * >>>     getItemValue={(b: Bill) => b.id}
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
 * >>>     getItemValue={(b: Bill) => b.id}
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
  options,
  isReady = true,
  strictValueLookup = true,
  onChange,
  onSelect,
  onDeselect,
  onClear,
  ...params
}: UseDataSelectParams<M, O>): types.ManagedDataSelect<
  M,
  O,
  types.DataSelectNullableModelValue<M, O> | types.NotSet
> => {
  const { getItemValue } = useDataSelectOptions<M, O>({ options });

  const {
    isSelected: _isSelected,
    toggle: _toggle,
    select: _select,
    deselect: _deselect,
    value,
    setValue: _setValue,
    clear: _clear,
    ...rest
  } = useSelect<types.InferredDataSelectValue<M, O>, O["behavior"]>({
    ...params,
    isReady,
    behavior: options.behavior,
    onChange: (v, params) => {
      if (modelValue === types.NOTSET) {
        logger.error(
          "Detected a change event in the select when the model value has not yet been set!",
        );
        return;
      }
      const reduced = reduceModelValue(modelValue, v, {
        strictValueLookup,
        options,
        data,
        getItemValue,
      });
      if (
        reduced === types.DONOTHING ||
        (reduced === null && options.behavior === types.SelectBehaviorTypes.SINGLE)
      ) {
        return;
      }
      /* This should only be called if the Select's model value is not "NOTSET" to begin with,
         because the Select will disable selection if it is not in a "ready" state. */
      onChange?.(v, reduced as types.DataSelectModelValue<M, O>, params);
    },
    onSelect,
    onClear,
    onDeselect,
  });

  const getInitializedModelValue = useCallback(
    (v: types.SelectNullableValue<types.InferredDataSelectValue<M, O>, O["behavior"]>) =>
      getInitialModelValue({
        options,
        value: v,
        getModel: v => getModel(v, { data, strictValueLookup, getItemValue }),
      }),
    [data, strictValueLookup, options, getItemValue],
  );

  /* Manage the Select's model value in state in parallel to the Select's value.  See docstring
     on hook for more information. */
  const [modelValue, setModelValue] = useState<
    types.DataSelectNullableModelValue<M, O> | types.NotSet
  >(() => (isReady && value !== types.NOTSET ? getInitializedModelValue(value) : types.NOTSET));

  const setValue = useCallback(
    (v: types.DataSelectValue<M, O>) => {
      /* If the 'modelValue' has not yet been set/initialized, then we need to initialize it before
         we can apply the reducer to the value. */
      const mv: types.DataSelectNullableModelValue<M, O> =
        modelValue === types.NOTSET ? getInitializedModelValue(v) : modelValue;

      const reduced = reduceModelValue(mv, v, {
        strictValueLookup,
        options,
        data,
        getItemValue,
      });
      if (
        reduced === types.DONOTHING ||
        (reduced === null && options.behavior === types.SelectBehaviorTypes.SINGLE)
      ) {
        return;
      }
      _setValue(v, { __private_ignore_controlled_state__: true });
      setModelValue(reduced);
    },
    [
      modelValue,
      data,
      options,
      strictValueLookup,
      getInitializedModelValue,
      _setValue,
      getItemValue,
    ],
  );

  useEffect(() => {
    if (isReady && value !== types.NOTSET) {
      setValue(value as types.DataSelectValue<M, O>);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [value, isReady]);

  const callback = useCallback(
    <E extends types.SelectEvent>(
      updated: types.SelectValue<
        types.InferredDataSelectValue<M, O>,
        types.InferredDataSelectBehavior<M, O>
      >,
      params: types.SelectEventChangeParams<E, types.InferredDataSelectValue<M, O>> & {
        readonly dispatchChangeEvent?: boolean;
        readonly data?: M[];
      },
      cb?: types.DataSelectBaseEventChangeHandler<E, M, O>,
    ) => {
      if (modelValue === types.NOTSET) {
        logger.error(
          "Detected a change event in the select when the model value has not yet been set!",
        );
        return;
      }
      const reduced = reduceModelValue(modelValue, updated, {
        strictValueLookup,
        options,
        data: params.data ?? data,
        getItemValue,
      });
      if (
        reduced === types.DONOTHING ||
        (reduced === null && options.behavior === types.SelectBehaviorTypes.SINGLE)
      ) {
        return;
      }
      setModelValue(reduced);
      cb?.(updated, reduced as types.DataSelectModelValue<M, O>, params);
      if (params.dispatchChangeEvent !== false) {
        /* This should only be called if the Select's model value is not "NOTSET" to begin with,
           because the Select will disable selection if it is not in a "ready" state. */
        onChange?.(updated, reduced as types.DataSelectModelValue<M, O>, params);
      }
    },
    [data, modelValue, options, strictValueLookup, getItemValue, onChange],
  );

  const deselect = useCallback(
    (
      v: M | types.InferredDataSelectValue<M, O>,
      { dispatchChangeEvent }: types.SelectEventPublicArgs,
      cb?: types.DataSelectBaseEventChangeHandler<typeof types.SelectEvents.DESELECT, M, O>,
    ) =>
      _deselect(
        typeof v === "string" || typeof v === "number" ? v : getItemValue(v as M),
        { dispatchChangeEvent: false },
        (updated, params) => callback(updated, { ...params, dispatchChangeEvent }, cb),
      ),
    [_deselect, callback, getItemValue],
  );

  const select = useCallback(
    (
      v: M | types.InferredDataSelectValue<M, O>,
      {
        dispatchChangeEvent,
        optimisticModels,
      }: types.SelectEventPublicArgs & { readonly optimisticModels?: M[] },
      cb?: types.DataSelectBaseEventChangeHandler<typeof types.SelectEvents.SELECT, M, O>,
    ) =>
      _select(
        typeof v === "string" || typeof v === "number" ? v : getItemValue(v as M),
        { dispatchChangeEvent: false },
        (updated, params) =>
          callback(
            updated,
            {
              ...params,
              dispatchChangeEvent,
              /* Add any additional, potentially optimistically added models to the data that is
                 used to lookup the value. */
              data: uniqBy([...data, ...(optimisticModels ?? [])], getItemValue),
            },
            cb,
          ),
      ),
    [data, _select, callback, getItemValue],
  );

  const clear = useCallback(
    (
      { dispatchChangeEvent }: types.SelectEventPublicArgs,
      cb?: types.DataSelectBaseEventChangeHandler<typeof types.SelectEvents.CLEAR, M, O>,
    ) =>
      _clear({ dispatchChangeEvent: false }, (updated, params) =>
        callback(updated, { ...params, dispatchChangeEvent }, cb),
      ),
    [_clear, callback],
  );

  const toggle = useCallback(
    (
      v: types.InferredDataSelectValue<M, O> | M,
      { dispatchChangeEvent }: types.SelectEventPublicArgs,
      cb?: types.DataSelectBaseEventChangeHandler<
        typeof types.SelectEvents.DESELECT | typeof types.SelectEvents.SELECT,
        M,
        O
      >,
    ) =>
      _toggle(
        typeof v === "string" || typeof v === "number" ? v : getItemValue(v as M),
        { dispatchChangeEvent: false },
        (updated, params) => callback(updated, { ...params, dispatchChangeEvent }, cb),
      ),
    [_toggle, callback, getItemValue],
  );

  return {
    ...rest,
    value,
    modelValue,
    setValue,
    isSelected: (v: M | types.InferredDataSelectValue<M, O>) =>
      _isSelected(typeof v === "string" || typeof v === "number" ? v : getItemValue(v as M)),
    select,
    deselect: types.ifDataSelectDeselectable(deselect, options),
    toggle,
    clear: types.ifDataSelectDeselectable(clear, options),
  };
};
