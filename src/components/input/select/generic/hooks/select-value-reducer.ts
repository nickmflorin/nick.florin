import { type Reducer } from "react";

import isEqual from "lodash.isequal";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/application/logger";
import { getModelId, getModelLabel } from "~/components/menus";

import * as types from "../types";

interface SelectValueReducerConfig<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> {
  readonly options: O;
}

export interface SelectValueState<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> {
  readonly valueArray: types.SelectDataValue<V, O>[];
  readonly value: types.SelectValue<V, O>;
  readonly modelsArray: types.SelectDataModel<V, M, O>[];
  readonly models: types.SelectModeledValue<V, M, O>;
  readonly data: types.SelectData<V, M, O>;
  readonly isReady: boolean;
  readonly pendingValue?: types.SelectDataValue<V, O>[];
}

export enum SelectValueActionType {
  Select = "SELECT",
  Sync = "SYNC",
}

type SelectValueSyncAction<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> = {
  readonly type: typeof SelectValueActionType.Sync;
  readonly value?: types.SelectValue<V, O>;
  readonly data?: types.SelectData<V, M, O>;
  readonly isReady: boolean;
};

type SelectValueSelectAction<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> = {
  readonly type: typeof SelectValueActionType.Select;
  readonly value: types.SelectArg<V, M, O>;
};

export type SelectValueAction<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> = SelectValueSelectAction<V, M, O> | SelectValueSyncAction<V, M, O>;

const findModelInData = <
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>({
  data,
  value,
  options,
  isReady,
}: {
  isReady: boolean | undefined;
  data: M[];
  value: V;
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

const syncModels = <
  S extends Pick<
    SelectValueState<V, M, O>,
    "isReady" | "valueArray" | "data" | "pendingValue" | "modelsArray"
  >,
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>(
  state: S,
  options: O,
): S & Pick<SelectValueState<V, M, O>, "models"> => {
  if (options.isMulti) {
    return { ...state, models: state.modelsArray as types.SelectModeledValue<V, M, O> };
  } else if (state.modelsArray.length === 0) {
    if (options.isNullable === false) {
      throw new TypeError("Detected an empty array of models for non-nullable select!");
    }
    return { ...state, models: null as types.SelectModeledValue<V, M, O> };
  } else if (state.modelsArray.length > 1) {
    logger.warn("Detected multiple models in state for a single-select... using the first value.", {
      models: state.modelsArray,
      options,
    });
  }
  return { ...state, models: state.modelsArray[0] as types.SelectModeledValue<V, M, O> };
};

const syncSelectValue = <
  S extends Pick<SelectValueState<V, M, O>, "isReady" | "valueArray" | "data" | "pendingValue">,
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>(
  state: S,
  options: O,
): S & Pick<SelectValueState<V, M, O>, "value"> => {
  if (options.isMulti) {
    return { ...state, value: state.valueArray as types.SelectValue<V, O> };
  } else if (state.valueArray.length === 0) {
    if (options.isNullable === false) {
      throw new TypeError("Detected an empty array of values in state for non-nullable select!");
    }
    return { ...state, value: null as types.SelectValue<V, O> };
  } else if (state.valueArray.length > 1) {
    logger.warn("Detected multiple values in state for a single-select... using the first value.", {
      value: state.valueArray,
      options,
    });
  }
  return { ...state, value: state.valueArray[0] as types.SelectValue<V, O> };
};

export const syncState = <
  S extends Pick<SelectValueState<V, M, O>, "isReady" | "valueArray" | "data" | "pendingValue">,
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>(
  state: S,
  options: O,
): S & Pick<SelectValueState<V, M, O>, "modelsArray" | "models" | "value"> => {
  let update0: S & Pick<SelectValueState<V, M, O>, "modelsArray">;
  /* Finding the corresponding models for the case when the Select is filtered is not applicable,
     because all the models that correspond to each value in the Select's value array may not be
     present if the models/data are filtered. */
  if (state.isReady && options.isValueModeled !== true) {
    update0 = {
      ...state,
      modelsArray: (state.valueArray as V[]).reduce((prev: M[], curr: V): M[] => {
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
      }, [] as M[]) as types.SelectDataModel<V, M, O>[],
    };
  } else {
    update0 = {
      ...state,
      modelsArray: state.valueArray as types.SelectValueModel<V>[] as types.SelectDataModel<
        V,
        M,
        O
      >[],
    };
  }
  const update1 = syncSelectValue<typeof update0, V, M, O>(update0, options);
  return syncModels<typeof update1, V, M, O>(update1, options);
};

export const toValueArray = <
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>(
  v: types.SelectValue<V, O>,
  options: O,
) => {
  if (options.isMulti) {
    if (!Array.isArray(v)) {
      throw new TypeError(`Expected an array value for a multi-select, but received: ${v}!`);
    }
    return v as types.SelectDataValue<V, O>[];
  } else if (Array.isArray(v)) {
    throw new TypeError(`Expected a non-array value for a single-select, but received: ${v}!`);
  } else if (v === null) {
    return [] as types.SelectDataValue<V, O>[];
  }
  return [v] as types.SelectDataValue<V, O>[];
};

export const initializeState = <
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
>({
  initialValue,
  value,
  options,
  data,
}: {
  readonly initialValue?: types.SelectValue<V, O>;
  readonly value?: types.SelectValue<V, O>;
  readonly data?: types.SelectData<V, M, O>;
  readonly options: O;
}): SelectValueState<V, M, O> => {
  if (options.isValueModeled !== true && data === undefined) {
    throw new TypeError(
      "The 'data' must be used to initialize the reducer state when the 'isValueModeled' " +
        "option is not true!",
    );
  }
  return syncState(
    {
      valueArray: initialValue
        ? toValueArray<V, M, O>(initialValue, options)
        : value
          ? toValueArray<V, M, O>(value, options)
          : [],
      modelsArray: [],
      isReady: false,
      data: data as types.SelectData<V, M, O>,
      pendingValue: [],
    },
    options,
  );
};

export type SelectValueReducer<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> = Reducer<SelectValueState<V, M, O>, SelectValueAction<V, M, O>>;

export const createSelectValueReducer =
  <
    V extends types.AllowedSelectModelValue,
    M extends types.SelectModel<V>,
    O extends types.SelectOptions<V, M>,
  >({
    options,
  }: SelectValueReducerConfig<V, M, O>): SelectValueReducer<V, M, O> =>
  (
    state: SelectValueState<V, M, O>,
    action: SelectValueAction<V, M, O>,
  ): SelectValueState<V, M, O> => {
    switch (action.type) {
      case SelectValueActionType.Sync:
        if (options.isValueModeled !== true && action.data === undefined) {
          throw new TypeError(
            "The 'data' must be used to sync the reducer state when the 'isValueModeled' " +
              "option is not true!",
          );
        }
        return syncState(
          {
            ...state,
            isReady: action.isReady,
            data: action.data as types.SelectData<V, M, O>,
            valueArray:
              action.value !== undefined
                ? toValueArray<V, M, O>(action.value, options)
                : state.valueArray,
          },
          options,
        );
      case SelectValueActionType.Select: {
        if (options.isValueModeled) {
          if (typeof action.value === "string") {
            throw new TypeError(
              "The select's state cannot be altered with a string value when using value models!",
            );
          }
          const actionV = types.getSelectModelValue<V, M, O>(action.value as M, options);
          const stateV = state.valueArray as types.SelectValueModel<V>[];

          /* If the value is already selected, and the Select is "de-selectable" or "nullable",
             deselect it - otherwise, do nothing. */
          if (stateV.map(v => v.value).includes(actionV)) {
            if (options.isDeselectable !== false || options.isNullable !== false) {
              const newState: SelectValueState<V, M, O> = {
                ...state,
                valueArray: stateV.filter(v => v.value !== actionV) as types.SelectDataValue<
                  V,
                  O
                >[],
              };
              return syncState<SelectValueState<V, M, O>, V, M, O>(newState, options);
            }
            // Do nothing.
            return state;
          }
          const newV: types.SelectValueModel<V> = types.selectValueModel({
            value: actionV,
            /* Note: The label may be undefined here - but that is okay because it is assignable to
               a ReactNode.  We may want to restrict the type in the future, however, so that the
               label must be defined when using value models. */
            label: getModelLabel(action.value as M, options),
            id: getModelId(action.value as M, options),
          });
          if (options.isMulti) {
            return syncState<SelectValueState<V, M, O>, V, M, O>(
              {
                ...state,
                valueArray: [...state.valueArray, newV] as types.SelectDataValue<V, O>[],
              },
              options,
            );
          }
          return syncState(
            { ...state, valueArray: [newV] as types.SelectDataValue<V, O>[] },
            options,
          );
        }
        const actionV =
          typeof action.value === "string"
            ? (action.value as V)
            : types.getSelectModelValue<V, M, O>(action.value as M, options);
        const stateV = state.valueArray as V[];

        /* If the value is already selected, and the Select is "de-selectable" or "nullable",
             deselect it - otherwise, do nothing. */
        if (stateV.includes(actionV)) {
          if (options.isDeselectable !== false && options.isNullable !== false) {
            const newState: SelectValueState<V, M, O> = {
              ...state,
              valueArray: stateV.filter(v => v !== actionV) as types.SelectDataValue<V, O>[],
            };
            return syncState<SelectValueState<V, M, O>, V, M, O>(newState, options);
          }
          // Do nothing.
          return state;
        } else if (options.isMulti) {
          return syncState<SelectValueState<V, M, O>, V, M, O>(
            {
              ...state,
              valueArray: [...state.valueArray, actionV] as types.SelectDataValue<V, O>[],
            },
            options,
          );
        }
        /* In this case, the Select is a single-select, and the updated value is simply the value
           associated with the action. */
        return syncState(
          { ...state, valueArray: [actionV] as types.SelectDataValue<V, O>[] },
          options,
        );
      }
      default:
        throw new UnreachableCaseError();
    }
  };
