import { useCallback, useEffect, useRef } from 'react';

import {
  type FilterFieldName,
  type FilterRefs,
  type Filters,
  type FiltersValues,
} from '~/lib/filters';

export interface UseFilterRefsParams<F extends Filters> {
  readonly filters: F;
  readonly values: FiltersValues<F>;
}

export const useFilterRefs = <F extends Filters>(
  fieldRefs: FilterRefs<F>,
  { filters, values }: UseFilterRefsParams<F>,
) => {
  const refs = useRef<FilterRefs<F>>(fieldRefs);

  /* The refs the callbacks below operate on are refreshed after every commit, so that the callbacks
     can stay referentially stable without going stale. */
  useEffect(() => {
    refs.current = fieldRefs;
  });

  const clear = useCallback(() => {
    for (const field in refs.current) {
      filters.clearFieldRefValue(field, refs.current);
    }
  }, [filters]);

  const sync = useCallback(
    (filts: FiltersValues<F>) => {
      for (const field in refs.current) {
        filters.setFieldRefValue(field, filts[field as FilterFieldName<F>], refs.current);
      }
    },
    [filters],
  );

  useEffect(() => {
    sync(values);
  }, [values, sync]);

  return { clear, refs: fieldRefs, sync };
};
