import { type Reducer } from "react";

import isEqual from "lodash.isequal";

import { logger } from "~/application/logger";

import * as types from "../types";

interface SelectValueReducerConfig<M extends types.SelectModel, O extends types.SelectOptions<M>> {
  readonly options: O;
}

export interface SelectValueState<
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> {
  readonly value: D[];
  readonly models: M[];
  readonly data: M[];
  readonly isReady: boolean;
  readonly pendingValue?: D[];
}

export enum SelectValueActionType {
  Select = "SELECT",
  Sync = "SYNC",
}

type SelectValueSyncAction<
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = {
  readonly type: typeof SelectValueActionType.Sync;
  readonly value?: D[];
  readonly data: M[];
  readonly isReady: boolean;
};

type SelectValueSelectAction<
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = {
  readonly type: typeof SelectValueActionType.Select;
  readonly value: D;
};

export type SelectValueAction<
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = SelectValueSelectAction<D, M, O> | SelectValueSyncAction<D, M, O>;

const findModelInData = <M extends types.SelectModel, O extends types.SelectOptions<M>>({
  data,
  value,
  options,
  isReady,
}: {
  isReady: boolean | undefined;
  data: M[];
  value: types.SelectModelValue<M, O>;
  options: O;
}): M | null => {
  const corresponding = data.filter(m => isEqual(types.getSelectModelValue(m, options), value));
  if (corresponding.length > 1) {
    logger.error(
      `Multiple models correspond to the same value, '${value}'!  This should not happen, ` +
        "the value should uniquely identify a model in the data!",
    );
    /* The relationship between the model and value should be unique, but in case it is not - we
       do not want to throw an error, but rather log it.  As a fallback, we will return the first
       model that corresponds to the value. */
    return corresponding[0];
  } else if (corresponding.length === 0) {
    /* If the asynchronously loaded data has not yet been received, do not issue a warning if the
       Select's value cannot be associated with a model in the data.  In this case, the Select will
       be in a "locked" state, and prevent selection - and once the data is received, the model
       *should* be present in the data (and if it is not, a warning will be logged). */
    if (!isReady) {
      return null;
    }
    /*
    Non Multi Menu Case
    -------------------
    In the case of a non-multi menu, if the value is not null but is not associated with any model
    in the dataset, we cannot return a null model value if the menu is also non-nullable.  This is
    because all of the callback logic in the Menu will assume that the model value is non-nullable
    (since it should be) if the value is also non-nullable.

    In this case, we have to throw an error that indicates the value is not tied to a model in the
    data, instead of logging it discretely.

    If the above case holds with the exception that the menu is nullable, we can more gracefully log
    the error, and return a null model value - since the callback logic will be typed such that a
    null model value is possible (since the value can be nullable).

    Multi Menu Case
    ---------------
    In the case of a multi menu, if a value in the value array is not associated with any model in
    the dataset, this is still an error - but we can more gracefully handle it by logging and simply
    excluding that potential model from the set of models represented by the array of values. */

    let msg: string;
    if (typeof value === "string" && value.trim() === "") {
      msg =
        "The value is an empty string, which is not associated with any model in the data!\n" +
        "Did you forget to set the 'isReady' flag?";
    } else {
      msg =
        `No models correspond to the value, '${value}'!  This should not happen, the value ` +
        "should uniquely identify the model!\n" +
        "Did you forget to set the 'isReady' flag?";
    }
    if (options.isMulti) {
      // Log the error and exclude the model from the valued data set.
      logger.error(msg);
      return null;
    } else if (options.isNullable === false) {
      throw new TypeError(msg);
    }
    logger.error(msg);
    return null;
  }
  return corresponding[0];
};

const updateModelsAndReturn = <
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>(
  state: SelectValueState<D, M, O>,
  options: O,
): SelectValueState<D, M, O> => {
  /* Finding the corresponding models for the case when the Select is filtered is not applicable,
     because all the models that correspond to each value in the Select's value array may not be
     present if the models/data are filtered. */
  if (state.isReady && !options.isFiltered) {
    return {
      ...state,
      models: (state.value as types.SelectModelValue<M, O>[]).reduce((prev: M[], curr): M[] => {
        const model = findModelInData({
          data: state.data,
          isReady: true,
          value: curr,
          options,
        });
        if (model) {
          return [...prev, model];
        }
        return prev;
      }, [] as M[]),
    };
  }
  return state;
};

export type SelectValueReducer<
  D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = Reducer<SelectValueState<D, M, O>, SelectValueAction<D, M, O>>;

export const createSelectValueReducer =
  <
    D extends types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >({
    options,
  }: SelectValueReducerConfig<M, O>): SelectValueReducer<D, M, O> =>
  (
    state: SelectValueState<D, M, O>,
    action: SelectValueAction<D, M, O>,
  ): SelectValueState<D, M, O> => {
    switch (action.type) {
      case SelectValueActionType.Sync:
        return updateModelsAndReturn(
          {
            ...state,
            isReady: action.isReady,
            data: action.data,
            value: action.value ?? state.value,
          },
          options,
        );
      case SelectValueActionType.Select: {
        const isAlreadySelected =
          state.value.filter(v => isEqual(typeof v === "string" ? v : v.value, action.value))
            .length > 0;
        /* If the value is already selected, and the Select is "de-selectable" or "nullable",
           deselect it - otherwise, do nothing. */
        if (isAlreadySelected) {
          if (options.isDeselectable !== false || options.isNullable !== false) {
            return updateModelsAndReturn(
              {
                ...state,
                value: state.value.filter(
                  v => !isEqual(typeof v === "string" ? v : v.value, action.value),
                ),
              },
              options,
            );
          }
          return state;
        } else if (options.isMulti) {
          return updateModelsAndReturn(
            {
              ...state,
              value: [...state.value, action.value],
            },
            options,
          );
        }
        return updateModelsAndReturn({ ...state, value: [action.value] }, options);
      }
      default:
        return state;
    }
  };
