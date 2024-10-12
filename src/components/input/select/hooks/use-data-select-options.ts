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
  const getItemValue = useCallback(
    (m: M) => {
      if (options.getItemValue !== undefined) {
        return options.getItemValue(m) as types.InferV<{ model: M; options: O }>;
      } else if ("value" in m && m.value !== undefined) {
        return m.value as types.InferV<{ model: M; options: O }>;
      }
      throw new Error(
        "If the 'getItemValue' callback prop is not provided, each model must be attributed " +
          "with a defined 'value' property!",
      );
    },
    [options],
  );

  return { getItemValue };
};
