import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useOptimistic, useTransition } from 'react';

import {
  type FilterFieldName,
  type FilterRefs,
  type Filters,
  type FiltersValues,
} from '~/lib/filters';

import { parseQueryParams, stringifyQueryParams } from '~/integrations/http';

import { useFilterRefs } from './use-filter-refs';
import { useReferentialCallback } from './use-referential-callback';

export interface UseFiltersOptions {
  readonly maintainExisting?: boolean;
}

export type FiltersUpdate<F extends Filters> = Partial<FiltersValues<F>>;

export const useFilters = <F extends Filters>(
  filters: F,
  fieldRefs: FilterRefs<F>,
  opts?: UseFiltersOptions,
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* The fields that an update changed are only pending for as long as the navigation that applies
     them to the URL is in flight, which is exactly the lifetime of the transition that performs it.
     Holding them optimistically lets the transition itself discard them once it settles. */
  const [pendingFilters, setPendingFilters] = useOptimistic<Partial<FiltersValues<F>>>({});
  const [isPending, transition] = useTransition();

  const values = useMemo(() => filters.parse(searchParams), [filters, searchParams]);
  const managedRefs = useFilterRefs<F>(fieldRefs, { filters, values });

  const updateFilters = useReferentialCallback((update: FiltersUpdate<F>) => {
    let currentFilters = filters.parse(searchParams);

    let changedFilters: Partial<FiltersValues<F>> = {};
    for (const [field, value] of Object.entries(update)) {
      const f = field as FilterFieldName<F>;
      const v = value as FiltersValues<F>[typeof f];

      let newV: FiltersValues<F>[typeof f];

      [currentFilters, newV] = filters.add(currentFilters, f, v);
      /* The values parsed out of the URL are what the update is measured against, so that only the
         fields the update actually changes are reported as pending. */
      if (!filters.fieldValuesAreEqual(f, values[f], newV)) {
        changedFilters = { ...changedFilters, [f]: newV };
      }
    }
    let pruned = filters.prune(currentFilters);
    if (opts?.maintainExisting !== false) {
      const all = parseQueryParams(searchParams.toString());
      for (const [field, value] of Object.entries(all)) {
        if (!filters.contains(field)) {
          pruned = { ...pruned, [field]: value };
        }
      }
    }
    transition(() => {
      setPendingFilters(changedFilters);
      router.replace(`${pathname}?${stringifyQueryParams(pruned)}`);
    });
  });

  const clear = useCallback(() => {
    managedRefs.clear();
    updateFilters(filters.defaultValues);
  }, [managedRefs, filters.defaultValues, updateFilters]);

  return {
    ...managedRefs,
    clear,
    filters: values,
    isPending,
    pendingFilters: isPending ? pendingFilters : {},
    updateFilters,
  };
};
