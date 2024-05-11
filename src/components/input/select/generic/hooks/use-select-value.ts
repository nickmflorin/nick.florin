import { useMemo, useEffect, useReducer, useCallback } from "react";

import * as types from "../types";

import {
  createSelectValueReducer,
  SelectValueActionType,
  type SelectValueReducer,
  initializeState,
} from "./select-value-reducer";

interface UseSelectValueConfig<
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
> {
  readonly options: O;
  readonly initialValue?: types.SelectValue<V, O>;
  readonly value?: types.SelectValue<V, O>;
  readonly isReady: boolean;
  readonly data?: types.SelectData<V, M, O>;
}

export const useSelectValue = <
  V extends types.AllowedSelectModelValue,
  M extends types.SelectModel<V>,
  O extends types.SelectOptions<V, M>,
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
    (v: types.SelectArg<V, M, O>) => {
      dispatch({ type: SelectValueActionType.Select, value: v });
      return reducer(state, { type: SelectValueActionType.Select, value: v });
    },
    [state, reducer],
  );

  const isSelected = useCallback(
    (val: types.SelectArg<V, M, O>) => {
      const v = typeof val === "string" ? val : types.getSelectModelValue(val as M, options);
      return state.valueArray.map(sv => (typeof sv === "string" ? sv : sv.value)).includes(v as V);
    },
    [state.valueArray, options],
  );

  return {
    ...state,
    onSelect,
    isSelected,
  };
};
