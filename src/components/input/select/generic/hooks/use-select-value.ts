import { useMemo, useEffect, useReducer, useCallback } from "react";

import * as types from "../types";

import {
  createSelectValueReducer,
  SelectValueActionType,
  type SelectValueReducer,
  initializeState,
} from "./select-value-reducer";

interface UseSelectValueConfig<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> {
  readonly options: O;
  readonly initialValue?: types.UnsafeSelectValue<V, M, O>;
  readonly value?: types.UnsafeSelectValue<V, M, O>;
  readonly isReady: boolean;
  readonly data: M[];
}

export const useSelectValue = <
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
>({
  options,
  initialValue,
  data,
  isReady = true,
  value,
}: UseSelectValueConfig<V, M, O>) => {
  const reducer = useMemo(
    () =>
      createSelectValueReducer<V, M, O>({
        options,
      }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );

  const [state, dispatch] = useReducer<SelectValueReducer<V, M, O>>(
    reducer,
    initializeState({ initialValue, value, data, options }),
  );

  useEffect(() => {
    dispatch({
      type: SelectValueActionType.Sync,
      value: value,
      data: data,
      isReady,
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isReady, value, data]);

  const onSelect = useCallback(
    (v: types.SelectArg<M, O>) => {
      dispatch({ type: SelectValueActionType.Select, value: v });
      return reducer(state, { type: SelectValueActionType.Select, value: v });
    },
    [state, reducer],
  );

  const clear = useCallback(() => {
    dispatch({ type: SelectValueActionType.Clear });
    return reducer(state, { type: SelectValueActionType.Clear });
  }, [state, reducer]);

  const isSelected = useCallback(
    (val: types.SelectArg<M, O>) => {
      const v = typeof val === "string" ? val : types.getSelectModelValue(val as M, options);
      return state.valueArray
        .map(
          (sv): types.SelectModelValue<M, O> =>
            (typeof sv === "string" ? sv : sv.value) as types.SelectModelValue<M, O>,
        )
        .includes(v);
    },
    [state.valueArray, options],
  );

  const isNullish = useMemo(() => state.valueArray.length === 0, [state.valueArray]);

  return {
    ...state,
    isNullish,
    clear,
    onSelect,
    isSelected,
  };
};
