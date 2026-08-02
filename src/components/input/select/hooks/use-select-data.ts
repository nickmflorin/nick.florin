import { type RefObject, useCallback, useState } from 'react';

import { isEqual } from 'lodash-es';

import { logger } from '~/internal/logger';

import type * as types from '~/components/input/select/types';

export interface UseSelectDataParams<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> {
  readonly base: RefObject<null | types.DataSelectBaseInstance<M, O>>;
  readonly data: types.ConnectedDataSelectModel<M, O>[];
}

/**
 * Selects the given model on the base Select instance, including it among the optimistic models
 * used to resolve the corresponding value.
 *
 * The recently added model must be included in the optimistic models that {@link
 * types.DataSelectBaseInstance.select} accepts so that 'select' can determine the underlying value
 * from both the provided optimistic models and the models already in state.
 *
 * Without it, 'select' may fail to find the model in 'data', because React batches state updates:
 * the instruction to add the model to the 'data' state is dispatched in the same batch as the
 * select call, so 'data' has not yet updated by the time 'select' looks up the model that
 * corresponds to the Select's new value.
 *
 * @param {types.DataSelectBaseInstance<M, O>} base The Select instance the model is selected on.
 * @param {types.ConnectedDataSelectModel<M, O>} model The model that was added, to be selected.
 * @param {boolean} dispatchChangeEvent Whether a change event should be dispatched for the select.
 */
const selectOptimisticModel = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>(
  base: types.DataSelectBaseInstance<M, O>,
  model: types.ConnectedDataSelectModel<M, O>,
  dispatchChangeEvent: boolean | undefined,
) => base.select(model, { dispatchChangeEvent, optimisticModels: [model] });

export const useSelectData = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  base,
  data,
}: UseSelectDataParams<M, O>) => {
  const [optimisticData, setOptimisticData] =
    useState<types.ConnectedDataSelectModel<M, O>[]>(data);
  const [syncedData, setSyncedData] = useState<types.ConnectedDataSelectModel<M, O>[]>(data);

  /* The optimistic data is re-seeded during render, rather than from an effect, whenever the data
     provided to the hook changes.  React applies a state update performed during render before it
     commits, so this avoids the additional committed render that an effect would cause.  The
     comparison is by value because the data is re-created on each render of the caller. */
  if (!isEqual(data, syncedData)) {
    setSyncedData(data);
    setOptimisticData(data);
  }

  const _addOptimisticModel = useCallback(
    (
      m:
        | ((
            curr: types.ConnectedDataSelectModel<M, O>[],
          ) => [types.ConnectedDataSelectModel<M, O>, types.ConnectedDataSelectModel<M, O>[]])
        | types.ConnectedDataSelectModel<M, O>,
    ): types.ConnectedDataSelectModel<M, O> => {
      if (typeof m === 'function') {
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
    addOptimisticModel: (
      m:
        | ((
            curr: types.ConnectedDataSelectModel<M, O>[],
          ) => [types.ConnectedDataSelectModel<M, O>, types.ConnectedDataSelectModel<M, O>[]])
        | types.ConnectedDataSelectModel<M, O>,
      { dispatchChangeEvent, select: shouldSelect }: types.AddOptimisticModelParams,
    ) => {
      if (base.current) {
        const model = _addOptimisticModel(m);
        if (shouldSelect) {
          selectOptimisticModel(base.current, model, dispatchChangeEvent);
        }
      } else {
        logger.error(
          'The base instance is not available in the UI - an optimistic model cannot be selected.',
        );
      }
    },
    data: optimisticData,
  };
};
