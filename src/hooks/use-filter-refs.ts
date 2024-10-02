import { useRef, useCallback, useEffect } from "react";

import {
  type Filters,
  type FilterFieldName,
  type FiltersValues,
  type FilterRefs,
} from "~/lib/filters";

export interface UseFilterRefsParams<F extends Filters> {
  readonly values: FiltersValues<F>;
  readonly filters: F;
}

export const useFilterRefs = <F extends Filters>(
  fieldRefs: FilterRefs<F>,
  { values, filters }: UseFilterRefsParams<F>,
) => {
  const refs = useRef<FilterRefs<F>>(fieldRefs);

  const clear = useCallback(() => {
    for (const field in refs.current) {
      filters.clearFieldRefValue(field as FilterFieldName<F>, refs.current);
    }
  }, [filters]);

  const sync = useCallback(
    (filts: FiltersValues<F>) => {
      for (const field in refs.current) {
        filters.setFieldRefValue(
          field as FilterFieldName<F>,
          filts[field as FilterFieldName<F>],
          refs.current,
        );
      }
    },
    [filters],
  );

  useEffect(() => {
    sync(values);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [values]);

  return { refs: refs.current, clear, sync };
};
