import { useState, useCallback } from "react";

import { logger } from "~/internal/logger";

import type * as types from "~/components/input/select/types";
import { useDeepEqualEffect } from "~/hooks";

export interface UseSelectDataParams<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> {
  readonly data: types.ConnectedDataSelectModel<M, O>[];
  readonly base: types.DataSelectBaseInstance<M, O> | null;
}

export const useSelectData = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  data,
  base,
}: UseSelectDataParams<M, O>) => {
  const [optimisticData, setOptimisticData] =
    useState<types.ConnectedDataSelectModel<M, O>[]>(data);

  useDeepEqualEffect(() => {
    setOptimisticData(data);
  }, [data]);

  const _addOptimisticModel = useCallback(
    (
      m:
        | types.ConnectedDataSelectModel<M, O>
        | ((
            curr: types.ConnectedDataSelectModel<M, O>[],
          ) => [types.ConnectedDataSelectModel<M, O>, types.ConnectedDataSelectModel<M, O>[]]),
    ): types.ConnectedDataSelectModel<M, O> => {
      if (typeof m === "function") {
        const [model, population] = m(optimisticData);
        setOptimisticData(population);
        return model;
      }
      setOptimisticData(curr => [...curr, m]);
      return m;
    },
    [optimisticData],
  );

  return {
    data: optimisticData,
    addOptimisticModel: (
      m:
        | types.ConnectedDataSelectModel<M, O>
        | ((
            curr: types.ConnectedDataSelectModel<M, O>[],
          ) => [types.ConnectedDataSelectModel<M, O>, types.ConnectedDataSelectModel<M, O>[]]),
      { select: shouldSelect, dispatchChangeEvent }: types.AddOptimisticModelParams,
    ) => {
      if (base) {
        const model = _addOptimisticModel(m);
        if (shouldSelect && model) {
          /* Include the recently added model to the set of optimistic models that the 'select'
             method accepts.  This allows the 'select' method to determine what the underlying
             value should be, based on both the provided optimistic models and the models already
             in state.

             If we do not include the 'optimisticModels' here, then the 'select' method may issue
             an error when it tries to find the models in the 'data' that correspond to it's
             updated value that is updated inside the 'select' method.  This is because React
             batches state updates, and we both (a) add the model to the 'data' state array and
             (b) perform the select inside the same batch.

             In other words, we have already dispatched an instruction to add the model 'm' to
             the 'data' state variable via the '_addOptimisticModel' function.  However, the
             'data' state variable has not yet updated at the point in time in which this code
             block is reached - it's state value will not update until after this function closure
             exits.

             This means that when the 'select' method is called, it will still be looking at the
             stale 'data' state array - which doesn't include the added optimistic model 'm'.
             This will lead to an error as the 'select' method will attempt to find the models
             in the 'data' state that correspond to the updated value of the Select, which is
             updated inside the 'select' method. */
          base.select(model, { optimisticModels: [model], dispatchChangeEvent });
        }
      } else {
        logger.error(
          "The base instance is not available in the UI - an optimistic model cannot be selected.",
        );
      }
    },
  };
};
