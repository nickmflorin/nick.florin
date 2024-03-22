import { useCallback, useMemo } from "react";

import { snakeCaseToCamelCase } from "~/lib/formatters";
import { useMutableParams } from "~/hooks";

import { type QueryDrawerId, QueryDrawerIds, type DrawerQueryParams } from "./types";

export const useDrawerParams = (): {
  params: DrawerQueryParams;
  ids: typeof QueryDrawerIds;
  open: (param: QueryDrawerId, value: string) => void;
  close: (param: QueryDrawerId) => void;
  clearQuery: () => void;
} => {
  const { params: _params, set, clear } = useMutableParams();

  const open = useCallback(
    (param: QueryDrawerId, value: string) => {
      const others = QueryDrawerIds.values.filter(p => p !== param);
      set(param, value, { clear: others });
    },
    [set],
  );

  const close = useCallback((param: QueryDrawerId) => clear(param), [clear]);

  const params = useMemo(() => {
    const result: DrawerQueryParams = {} as DrawerQueryParams;
    for (const k of QueryDrawerIds.values) {
      result[snakeCaseToCamelCase(k)] = _params.get(k);
    }
    return result;
  }, [_params]);

  const clearQuery = useCallback(() => {
    clear([...QueryDrawerIds.values]);
  }, [clear]);

  return { params, open, close, ids: QueryDrawerIds, clearQuery };
};
