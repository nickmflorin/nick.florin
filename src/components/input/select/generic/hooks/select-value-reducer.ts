import { type Reducer } from "react";

import isEqual from "lodash.isequal";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/application/logger";
import { getModelId, getModelLabel } from "~/components/menus";

import * as types from "../types";

interface SelectValueReducerConfig<M extends types.SelectModel, O extends types.SelectOptions<M>> {
  readonly options: O;
}

export interface UnsetSelectValueState<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> {
  readonly selectionMade: false;
  readonly valueArray: types.SelectValueForm<V, M, O>[];
  readonly value: types.ValueNotSet;
  readonly modelsArray: types.SelectDataModel<V, M, O>[];
  readonly models: types.ValueNotSet;
  readonly data: M[];
  readonly isReady: boolean;
}

export interface SetSelectValueState<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> {
  readonly selectionMade: true;
  readonly valueArray: types.SelectValueForm<V, M, O>[];
  readonly value: types.SelectValue<V, M, O>;
  readonly modelsArray: types.SelectDataModel<V, M, O>[];
  readonly models: types.SelectModeledValue<V, M, O>;
  readonly data: M[];
  readonly isReady: boolean;
}

export type SelectValueState<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = SetSelectValueState<V, M, O> | UnsetSelectValueState<V, M, O>;

export enum SelectValueActionType {
  Select = "SELECT",
  Sync = "SYNC",
  Clear = "CLEAR",
}

type SelectValueSyncAction<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = {
  readonly type: typeof SelectValueActionType.Sync;
  readonly value?: types.UnsafeSelectValue<V, M, O>;
  readonly data: M[];
  readonly isReady: boolean;
};

type SelectValueSelectAction<M extends types.SelectModel, O extends types.SelectOptions<M>> = {
  readonly type: typeof SelectValueActionType.Select;
  readonly value: types.SelectArg<M, O>;
};

type SelectValueClearAction = {
  readonly type: typeof SelectValueActionType.Clear;
};

export type SelectValueAction<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = SelectValueSelectAction<M, O> | SelectValueSyncAction<V, M, O> | SelectValueClearAction;

const findModelInData = <M extends types.SelectModel, O extends types.SelectOptions<M>>({
  data,
  value,
  options,
  isReady,
  logMessage,
}: {
  isReady: boolean | undefined;
  data: M[];
  value: types.SelectModelValue<M, O>;
  options: O;
  logMessage?: string;
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
    if (!logMessage) {
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
    } else {
      msg = logMessage;
    }
    if (options.isMulti) {
      // Log the error and exclude the model from the valued data set.
      logger.error(msg);
      return null;
    } else if (!options.isDeselectable) {
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
    "isReady" | "valueArray" | "data" | "modelsArray" | "selectionMade"
  >,
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>(
  state: S,
  options: O,
): S & Pick<SelectValueState<V, M, O>, "models"> => {
  if (options.isMulti) {
    return { ...state, models: state.modelsArray as types.SelectModeledValue<V, M, O> };
  } else if (state.modelsArray.length === 0) {
    /* For a non-nullable Select, there may be a period of time before a selection was made that
       the models array is empty (because no selection was made yet).  This is okay - the
       nullability of the Select refers to the nullability of the Select's value after a selection
       is made, not when it is immediately rendered. */
    if (options.isDeselectable !== true) {
      /* If a selection has been made, and the value array is empty, it means that there is a bug
           in the code. */
      if (state.selectionMade) {
        throw new TypeError("Detected an empty array of models in state for non-nullable select!");
      }
      return { ...state, models: types.VALUE_NOT_SET };
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
  S extends Pick<SelectValueState<V, M, O>, "isReady" | "valueArray" | "data" | "selectionMade">,
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>(
  state: S,
  options: O,
): S & Pick<SelectValueState<V, M, O>, "value"> => {
  if (options.isMulti) {
    return { ...state, value: state.valueArray as types.SelectValue<V, M, O> };
  } else if (state.valueArray.length === 0) {
    /* For a non-nullable Select, there may be a period of time before a selection was made that
       the value array is empty (because no selection was made yet).  This is okay - the nullability
       of the Select refers to the nullability of the Select's value after a selection is made, not
       when it is immediately rendered. */
    if (options.isDeselectable !== true) {
      /* If a selection has been made, and the value array is empty, it means that there is a bug
         in the code. */
      if (state.selectionMade) {
        throw new TypeError("Detected an empty array of values in state for non-nullable select!");
      }
      return { ...state, value: types.VALUE_NOT_SET };
    }
    return { ...state, value: null as types.SelectValue<V, M, O> };
  } else if (state.valueArray.length > 1) {
    logger.warn("Detected multiple values in state for a single-select... using the first value.", {
      value: state.valueArray,
      options,
    });
  }
  return { ...state, value: state.valueArray[0] as types.SelectValue<V, M, O> };
};

export const syncState = <
  S extends Pick<SelectValueState<V, M, O>, "isReady" | "valueArray" | "data" | "selectionMade">,
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
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
      modelsArray: (state.valueArray as types.SelectModelValue<M, O>[]).reduce(
        (prev: M[], curr: types.SelectModelValue<M, O>): M[] => {
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
        },
        [] as M[],
      ) as types.SelectDataModel<V, M, O>[],
    };
  } else {
    /* In the case that the Select is value modeled, we do not need to wait for the Select to be
       in a ready state to set the models array because the models are represented by the valued
       models (provided as the 'value' prop) that are not dependent on asynchronously or externally
       loaded data.  Setting the models array in this fashion, without waiting for the Select to
       be in a ready state, causes the rendered SelectInput to immediately show the value
       representaiton of the Select, even if it is still waiting on asynchronously loaded data. */
    update0 = {
      ...state,
      modelsArray: state.valueArray as V[] as types.SelectDataModel<V, M, O>[],
    };
  }
  const update1 = syncSelectValue<typeof update0, V, M, O>(update0, options);
  return syncModels<typeof update1, V, M, O>(update1, options);
};

export const toValueArray = <
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>(
  v: types.UnsafeSelectValue<V, M, O>,
  options: O,
): types.SelectValueForm<V, M, O>[] => {
  if (options.isMulti) {
    if (!Array.isArray(v)) {
      throw new TypeError(`Expected an array value for a multi-select, but received: ${v}!`);
    }
    return v.map((vi): types.SelectValueForm<V, M, O> => {
      if (typeof vi === "string") {
        if (options.isValueModeled) {
          throw new TypeError(
            `Encountered a string value, '${vi}', in the provided set of values when the select ` +
              "is value modeled!",
          );
        }
        return vi as types.SelectValueForm<V, M, O>;
      }
      return {
        ...(vi as Omit<types.SelectValueModel<M, O>, "__valueModel__">),
        __valueModel__: true,
      } as types.SelectValueForm<V, M, O>;
    });
  } else if (Array.isArray(v)) {
    throw new TypeError(`Expected a non-array value for a single-select, but received: ${v}!`);
  } else if (v === null) {
    return [] as types.SelectValueForm<V, M, O>[];
  } else if (typeof v === "string") {
    if (options.isValueModeled) {
      throw new TypeError(`Encountered a string value, '${v}', when the select is value modeled!`);
    }
    return [v as types.SelectModelValue<M, O>] as types.SelectValueForm<V, M, O>[];
  }
  return [
    { ...(v as Omit<types.SelectValueModel<M, O>, "__valueModel__">), __valueModel__: true },
  ] as types.SelectValueForm<V, M, O>[];
};

export const initializeState = <
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>({
  initialValue,
  value,
  options,
  data,
}: {
  readonly initialValue?: types.UnsafeSelectValue<V, M, O>;
  readonly value?: types.UnsafeSelectValue<V, M, O>;
  readonly data: M[];
  readonly options: O;
}): UnsetSelectValueState<V, M, O> =>
  syncState(
    {
      valueArray:
        initialValue !== undefined
          ? toValueArray<V, M, O>(initialValue, options)
          : value !== undefined
            ? toValueArray<V, M, O>(value, options)
            : [],
      modelsArray: [],
      selectionMade: false,
      isReady: false,
      data: data,
    },
    options,
  ) as UnsetSelectValueState<V, M, O>;

export type SelectValueReducer<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> = Reducer<SelectValueState<V, M, O>, SelectValueAction<V, M, O>>;

export const createSelectValueReducer =
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >({
    options,
  }: SelectValueReducerConfig<M, O>): SelectValueReducer<V, M, O> =>
  (
    state: SelectValueState<V, M, O>,
    action: SelectValueAction<V, M, O>,
  ): SelectValueState<V, M, O> => {
    const getSelectValueModel = (
      action: SelectValueSelectAction<M, O>,
      s: SelectValueState<V, M, O>,
    ) => {
      /* If the action value is provided as a string, we need to find the associated model in the
         data that corresponds to the value.  Since the 'isValueModeled' option is true, it means
         that the data will be a filtered representation of all of the data - but since the item was
         just selected, it should be in the set of filtered data (because it has to be present to be
         selected). */
      if (typeof action.value === "string") {
        const model = findModelInData({
          data: s.data,
          isReady: true,
          value: action.value,
          options,
          logMessage:
            `Inconsistent State: The value ${action.value} is not associated with any models ` +
            "in state even though it was just selected and the state is ready.",
        });
        if (model) {
          return types.selectValueModel({
            id: getModelId(model, options) ?? (action.value as types.SelectModelValue<M, O>),
            label: getModelLabel(model, options),
            value: action.value as types.SelectModelValue<M, O>,
          });
        }
        return null;
      } else if (!types.isSelectValueModel(action.value)) {
        return types.selectValueModel({
          id:
            getModelId(action.value as M, options) ??
            types.getSelectModelValue<M, O>(action.value as M, options),
          label: getModelLabel(action.value as M, options),
          value: types.getSelectModelValue<M, O>(action.value as M, options),
        });
      }
      throw new TypeError(`Encountered invalid action value: ${action.value}!`);
    };

    switch (action.type) {
      case SelectValueActionType.Clear:
        return syncState(
          {
            ...state,
            valueArray: [],
          },
          options,
        );

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
            data: action.data as M[],
            valueArray:
              action.value !== undefined
                ? toValueArray<V, M, O>(action.value, options)
                : state.valueArray,
          },
          options,
        );

      case SelectValueActionType.Select: {
        // Do not make a selection if the Select is not yet ready.
        if (!state.isReady) {
          return state;
        } else if (options.isValueModeled) {
          if (state.valueArray.some(v => typeof v === "string")) {
            throw new TypeError(
              "Encountered string values in select state when 'isValueModeled' is true!",
            );
          }
          const stateV = state.valueArray as types.SelectValueModel<M, O>[];

          const selectValueModel = getSelectValueModel(action, state);
          if (!selectValueModel) {
            return state;
          }
          /* If the value is already selected, and the Select is "de-selectable" or "nullable",
             deselect it - otherwise, do nothing. */
          if (stateV.map(v => v.value).includes(selectValueModel.value)) {
            if (options.isDeselectable === true) {
              return syncState<SelectValueState<V, M, O>, V, M, O>(
                {
                  ...state,
                  selectionMade: true,
                  valueArray: stateV.filter(
                    v => v.value !== selectValueModel.value,
                  ) as types.SelectValueForm<V, M, O>[],
                } as SelectValueState<V, M, O>,
                options,
              ) as SetSelectValueState<V, M, O>;
            }
            // Do nothing.
            return state;
          }
          if (options.isMulti) {
            return syncState<SelectValueState<V, M, O>, V, M, O>(
              {
                ...state,
                selectionMade: true,
                valueArray: [...stateV, selectValueModel] as types.SelectValueForm<V, M, O>[],
              } as SelectValueState<V, M, O>,
              options,
            ) as SetSelectValueState<V, M, O>;
          }
          return syncState(
            {
              ...state,
              selectionMade: true,
              valueArray: [selectValueModel] as types.SelectValueForm<V, M, O>[],
            } as SelectValueState<V, M, O>,
            options,
          ) as SetSelectValueState<V, M, O>;
        }
        const actionV =
          typeof action.value === "string"
            ? action.value
            : types.getSelectModelValue<M, O>(action.value as M, options);

        const stateV = state.valueArray as types.SelectModelValue<M, O>[];

        /* If the value is already selected, and the Select is "de-selectable" or "nullable",
           deselect it - otherwise, do nothing. */
        if (stateV.includes(actionV)) {
          if (options.isDeselectable === true) {
            return syncState<SelectValueState<V, M, O>, V, M, O>(
              {
                ...state,
                selectionMade: true,
                valueArray: stateV.filter(v => v !== actionV) as types.SelectValueForm<V, M, O>[],
              } as SelectValueState<V, M, O>,
              options,
            ) as SetSelectValueState<V, M, O>;
          }
          // Do nothing.
          return state;
        } else if (options.isMulti) {
          return syncState<SelectValueState<V, M, O>, V, M, O>(
            {
              ...state,
              selectionMade: true,
              valueArray: [...state.valueArray, actionV] as types.SelectValueForm<V, M, O>[],
            } as SelectValueState<V, M, O>,
            options,
          ) as SetSelectValueState<V, M, O>;
        }
        /* In this case, the Select is a single-select, and the updated value is simply the value
           associated with the action. */
        return syncState(
          {
            ...state,
            selectionMade: true,
            valueArray: [actionV] as types.SelectValueForm<V, M, O>[],
          } as SelectValueState<V, M, O>,
          options,
        ) as SetSelectValueState<V, M, O>;
      }
      default:
        throw new UnreachableCaseError();
    }
  };
