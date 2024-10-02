import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  type Filters,
  type FilterFieldName,
  type FiltersValues,
  type FilterRefs,
} from "~/lib/filters";

import { parseQueryParams, stringifyQueryParams } from "~/integrations/http";

import { useFilterRefs } from "./use-filter-refs";
import { useReferentialCallback } from "./use-referential-callback";

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
  const { replace } = useRouter();
  const pathname = usePathname();

  const [pendingFilters, setPendingFilters] = useState<Partial<FiltersValues<F>>>({});
  const [isPending, transition] = useTransition();

  const values = useMemo(() => filters.parse(searchParams), [filters, searchParams]);

  const managedRefs = useFilterRefs<F>(fieldRefs, { values, filters });

  const previousFilters = useRef<FiltersValues<F>>(values);

  useEffect(() => {
    if (!isPending) {
      setPendingFilters({});
    }
  }, [isPending]);

  previousFilters.current = filters.parse(searchParams);

  const updateFilters = useReferentialCallback((update: FiltersUpdate<F>) => {
    let currentFilters = filters.parse(searchParams);

    let changedFilters: Partial<FiltersValues<F>> = {};
    for (const [field, value] of Object.entries(update)) {
      const f = field as FilterFieldName<F>;
      const v = value as FiltersValues<F>[typeof f];

      let newV: FiltersValues<F>[typeof f];

      [currentFilters, newV] = filters.add(currentFilters, f, v);
      if (!filters.fieldValuesAreEqual(f, previousFilters.current[f], newV)) {
        changedFilters = { ...changedFilters, [f]: newV };
      }
    }
    previousFilters.current = currentFilters;
    let pruned = filters.prune(currentFilters);
    if (opts?.maintainExisting !== false) {
      const all = parseQueryParams(searchParams.toString());
      for (const [field, value] of Object.entries(all)) {
        if (!filters.contains(field)) {
          pruned = { ...pruned, [field]: value };
        }
      }
    }
    setPendingFilters(changedFilters);
    transition(() => {
      replace(`${pathname}?${stringifyQueryParams(pruned)}`);
    });
  });

  const clear = useCallback(() => {
    managedRefs.clear();
    updateFilters(filters.defaultValues);
  }, [managedRefs, filters.defaultValues, updateFilters]);

  return {
    ...managedRefs,
    filters: values,
    isPending,
    pendingFilters: isPending ? pendingFilters : {},
    clear,
    updateFilters,
  };
};
