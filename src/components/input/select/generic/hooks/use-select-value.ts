import { useMemo, useEffect, useReducer, useCallback } from "react";

import { logger } from "~/application/logger";

import * as types from "../types";

import {
  createSelectValueReducer,
  SelectValueActionType,
  type SelectValueReducer,
  type SelectValueState,
} from "./select-value-reducer";

interface UseSelectValueConfig<M extends types.SelectModel, O extends types.SelectOptions<M>> {
  readonly options: O;
  readonly initialValue?: types.SelectPropValue<M, O>;
  readonly value?: types.SelectPropValue<M, O>;
  readonly isReady: boolean;
  readonly data: M[];
}

export const useSelectValue = <M extends types.SelectModel, O extends types.SelectOptions<M>>({
  options,
  initialValue,
  data,
  isReady = true,
  value,
}: UseSelectValueConfig<M, O>) => {
  const reducer = useMemo(
    () =>
      createSelectValueReducer<types.SelectValueModel<M, O> | types.SelectModelValue<M, O>, M, O>({
        options,
      }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );

  const toValueArray = useCallback(
    (v: types.SelectPropValue<M, O>) => {
      if (options.isMulti) {
        if (!Array.isArray(v)) {
          throw new TypeError(`Expected an array value for a multi-select, but received: ${v}!`);
        }
        return v as types.SelectValueModel<M, O>[] | types.SelectModelValue<M, O>[];
      } else if (Array.isArray(v)) {
        throw new TypeError(`Expected a non-array value for a single-select, but received: ${v}!`);
      } else if (v === null) {
        return [] as types.SelectValueModel<M, O>[] | types.SelectModelValue<M, O>[];
      }
      return [v] as types.SelectValueModel<M, O>[] | types.SelectModelValue<M, O>[];
    },
    [options],
  );

  const [state, dispatch] = useReducer<
    SelectValueReducer<types.SelectValueModel<M, O> | types.SelectModelValue<M, O>, M, O>
  >(reducer, {
    value: initialValue ? toValueArray(initialValue) : value ? toValueArray(value) : [],
    models: [],
    isReady: false,
    data: data,
  });

  useEffect(() => {
    dispatch({
      type: SelectValueActionType.Sync,
      value: value ? toValueArray(value) : undefined,
      data: data,
      isReady,
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isReady, value, data]);

  const transformToSelectValue = useCallback(
    (
      v: SelectValueState<
        types.SelectValueModel<M, O> | types.SelectModelValue<M, O>,
        M,
        O
      >["value"],
    ): types.SelectValue<M, O> => {
      if (options.isMulti) {
        return v.map(v => (typeof v === "string" ? v : v.value)) as types.SelectValue<M, O>;
      } else if (v.length === 0) {
        if (options.isNullable === false) {
          throw new TypeError("Detected empty value array for non-nullable select!");
        }
        return null as types.SelectValue<M, O>;
      } else if (v.length > 1) {
        logger.warn("Detected multiple values for a single-select; using the first value.", {
          value: v,
          options,
        });
      }
      return v[0] as types.SelectValue<M, O>;
    },
    [options],
  );

  const selectValue = useMemo<types.SelectValue<M, O>>(
    () => transformToSelectValue(state.value),
    [state.value, transformToSelectValue],
  );

  /* TODO: We should use generic types to ensure that the provided value argument is valid for
     the given case. */
  const onSelect = useCallback(
    (v: types.SelectValueModel<M, O> | types.SelectModelValue<M, O> | M) => {
      let valueToSelect: types.SelectValueModel<M, O> | types.SelectModelValue<M, O>;
      if (typeof v === "string") {
        if (options.isFiltered) {
          throw new Error("For a filtered select, the value must be a model - not a string.");
        }
        valueToSelect = v;
      } else if (options.isFiltered) {
        if (!types.isSelectValueDatum(v)) {
          throw new TypeError("For a filtered select, the value must be a SelectValueModel!");
        }
        valueToSelect = v as types.SelectValueModel<M, O>;
      } else {
        valueToSelect = types.getSelectModelValue(v as M, options);
      }
      dispatch({ type: SelectValueActionType.Select, value: valueToSelect });
      const newState = reducer(state, { type: SelectValueActionType.Select, value: valueToSelect });
      return { ...newState, selectValue: transformToSelectValue(newState.value) };
    },
    [state, options, reducer, transformToSelectValue],
  );

  const isSelected = useCallback(
    (v: types.SelectValueModel<M, O> | types.SelectModelValue<M, O> | M) =>
      state.value.includes(
        types.isSelectValueDatum(v)
          ? v.value
          : typeof v === "string"
            ? v
            : types.getSelectModelValue(v as M, options),
      ),
    [state.value, options],
  );

  return {
    ...state,
    selectValue,
    onSelect,
    isSelected,
    value: state.value as types.SelectPropValue<M, O>,
  };
};
