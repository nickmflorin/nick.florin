import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  type BaseFiltersConfiguration,
  type FiltersClass,
  type ParsedFilters,
} from "~/lib/filters";

import { parseQueryParams, stringifyQueryParams } from "~/integrations/http";

import { useReferentialCallback } from "~/hooks";

export interface UseFiltersOptions<C extends BaseFiltersConfiguration> {
  readonly filters: FiltersClass<C>;
  readonly maintainExisting?: boolean;
}

export type FiltersUpdate<C extends BaseFiltersConfiguration> = Partial<ParsedFilters<C>>;

export const useFilters = <C extends BaseFiltersConfiguration>({
  filters,
  maintainExisting = true,
}: UseFiltersOptions<C>) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const [pendingFilters, setPendingFilters] = useState<Partial<ParsedFilters<C>>>({});
  const [isPending, transition] = useTransition();

  const initialFilters = useMemo(() => filters.parse(searchParams), [filters, searchParams]);

  const previousFilters = useRef<ParsedFilters<C>>(initialFilters);

  useEffect(() => {
    if (!isPending) {
      setPendingFilters({});
    }
  }, [isPending]);

  previousFilters.current = filters.parse(searchParams);

  const setFilters = useReferentialCallback((update: FiltersUpdate<C>) => {
    let currentFilters = filters.parse(searchParams);

    let changedFilters: Partial<ParsedFilters<C>> = {};
    for (const [field, value] of Object.entries(update)) {
      let newValue: ParsedFilters<C>[keyof C];

      const f = field as keyof C;
      const v = value as ParsedFilters<C>[typeof f];
      [currentFilters, newValue] = filters.add(currentFilters, f, v);
      if (!filters.valuesAreEqual(f, previousFilters.current[f], newValue)) {
        changedFilters = { ...changedFilters, [f]: newValue };
      }
    }
    previousFilters.current = currentFilters;
    let pruned = filters.prune(currentFilters);

    if (maintainExisting) {
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

  return [
    initialFilters,
    setFilters,
    { isPending, pendingFilters: isPending ? pendingFilters : {} },
  ] as const;
};
