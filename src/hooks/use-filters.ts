import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  type BaseFiltersConfiguration,
  type FiltersClass,
  type ParsedFilters,
} from "~/lib/filters";

import { parseQueryParams, stringifyQueryParams } from "~/integrations/http-v2";

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

  const initialFilters = useMemo(() => filters.parse(searchParams), [filters, searchParams]);

  const setFilters = useReferentialCallback((update: FiltersUpdate<C>) => {
    let currentFilters = filters.parse(searchParams);
    for (const [field, value] of Object.entries(update)) {
      const f = field as keyof C;
      const v = value as ParsedFilters<C>[typeof f];
      currentFilters = filters.add(currentFilters, f, v);
    }
    let pruned = filters.prune(currentFilters);

    if (maintainExisting) {
      const all = parseQueryParams(searchParams.toString());
      for (const [field, value] of Object.entries(all)) {
        if (!filters.contains(field)) {
          pruned = { ...pruned, [field]: value };
        }
      }
    }
    replace(`${pathname}?${stringifyQueryParams(pruned)}`);
  });

  return [initialFilters, setFilters] as const;
};
