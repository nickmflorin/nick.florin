"use client";
import { useEffect, useRef, useCallback, type ReactNode } from "react";

import type { ApiSkill, ApiCompany } from "~/database/model";

import { ExperiencesFiltersObj, type ExperiencesFilters } from "~/actions-v2";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { CompanySelect } from "~/features/companies/components/input/CompanySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<keyof ExperiencesFilters, "search" | "highlighted" | "visible">;

export interface ExperiencesTableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly companies: ApiCompany<[]>[];
  readonly excludeFilters?: SelectFilterField[];
}

type FilterRefs = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key in SelectFilterField]: React.MutableRefObject<any>;
};

const useFilterRefs = ({ filters }: { filters: ExperiencesFilters }) => {
  const refs = useRef<FilterRefs>({
    companies: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
  });

  const clear = useCallback(() => {
    for (const ref of Object.values(refs.current)) {
      ref.current?.clear();
    }
  }, []);

  const sync = useCallback((filts: ExperiencesFilters) => {
    for (const [field, ref] of Object.entries(refs.current)) {
      if (ref.current) {
        const f = field as SelectFilterField;
        const v = filts[f];
        const setter = ref.current.setValue as (v: ExperiencesFilters[typeof f]) => void;
        setter(v);
      }
    }
  }, []);

  useEffect(() => {
    sync(filters);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filters]);

  return { refs: refs.current, clear, sync };
};

export const ExperiencesTableFilterBar = ({
  excludeFilters = [],
  children,
  companies,
  skills,
  ...props
}: ExperiencesTableFilterBarProps): JSX.Element => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, updateFilters, { pendingFilters }] = useFilters({
    filters: ExperiencesFiltersObj,
  });
  const { refs, clear } = useFilterRefs({ filters });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={searchInputRef}
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchPlaceholder="Search experiences..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_EXPERIENCE}
      search={filters.search}
      filters={filters}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({
          companies: [],
          skills: [],
          search: "",
        });
      }}
      configuration={[
        {
          id: "skills",
          label: "Skills",
          renderer: v => (
            <SkillsSelect
              ref={refs.skills}
              popoverClassName="z-50"
              isLoading={Object.keys(pendingFilters).includes("skills")}
              inputClassName="max-w-[320px]"
              placeholder="Skills"
              data={skills}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(skills: string[]) => updateFilters({ skills })}
              onClear={() => updateFilters({ skills: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "companies",
          label: "Companies",
          renderer: v => (
            <CompanySelect
              ref={refs.companies}
              isLoading={Object.keys(pendingFilters).includes("companies")}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Companies"
              data={companies}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(companies: string[]) => updateFilters({ companies })}
              onClear={() => updateFilters({ companies: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
      ]}
    >
      {children}
    </TableView.FilterBar>
  );
};
