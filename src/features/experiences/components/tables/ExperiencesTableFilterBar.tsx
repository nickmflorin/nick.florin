"use client";
import { useRef, type ReactNode } from "react";

import type { ApiSkill, ApiCompany } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { ExperiencesFiltersObj } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { CompanySelect } from "~/features/companies/components/input/CompanySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks";

export interface ExperiencesTableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly companies: ApiCompany<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof ExperiencesFiltersObj>[];
}

export const ExperiencesTableFilterBar = ({
  excludeFilters = [],
  children,
  companies,
  skills,
  ...props
}: ExperiencesTableFilterBarProps): JSX.Element => {
  const { filters, refs, pendingFilters, clear, updateFilters } = useFilters(
    ExperiencesFiltersObj,
    {
      companies: useRef<SelectInstance<string, "multi"> | null>(null),
      skills: useRef<SelectInstance<string, "multi"> | null>(null),
      search: useRef<HTMLInputElement | null>(null),
      visible: useRef<HTMLInputElement | null>(null),
      highlighted: useRef<HTMLInputElement | null>(null),
    },
  );

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={refs.search}
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchPlaceholder="Search experiences..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_EXPERIENCE}
      search={filters.search}
      filters={filters}
      onClear={() => clear()}
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
