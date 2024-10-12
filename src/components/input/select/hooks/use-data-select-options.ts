import { useCallback } from "react";

import type * as types from "~/components/input/select/types";

export interface UseDataSelectDataParams<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> {
  readonly options: O;
}

export const useDataSelectOptions = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  options,
}: UseDataSelectDataParams<M, O>) => {
  const getModelValue = useCallback(
    (m: M) => {
      if (options.getModelValue !== undefined) {
        return options.getModelValue(m) as types.InferV<{ model: M; options: O }>;
      } else if ("value" in m && m.value !== undefined) {
        return m.value as types.InferV<{ model: M; options: O }>;
      }
      throw new Error(
        "If the 'getModelValue' callback prop is not provided, each model must be attributed " +
          "with a defined 'value' property!",
      );
    },
    [options],
  );

  const getModelId = useCallback(
    (m: M) => {
      if (options.getModelId !== undefined) {
        return options.getModelId(m);
      } else if ("id" in m && m.id !== undefined) {
        return m.id;
      }
      return getModelValue(m);
    },
    [options, getModelValue],
  );

  return { getModelValue, getModelId };
};
