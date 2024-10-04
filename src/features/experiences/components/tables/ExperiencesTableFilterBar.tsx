"use client";
import { type ReactNode } from "react";

import type { ApiSkill, ApiCompany } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { ExperiencesFiltersObj } from "~/actions";

import { HighlightedFilterButton } from "~/components/buttons/HighlightedFilterButton";
import { VisibleFilterButton } from "~/components/buttons/VisibleFilterButton";
import { DrawerIds } from "~/components/drawers";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { CompanySelect } from "~/features/companies/components/input/CompanySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters, useFilterRef } from "~/hooks";

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
      companies: useFilterRef<"companies", typeof ExperiencesFiltersObj>(),
      skills: useFilterRef<"skills", typeof ExperiencesFiltersObj>(),
      search: useFilterRef<"search", typeof ExperiencesFiltersObj>(),
      visible: useFilterRef<"visible", typeof ExperiencesFiltersObj>(),
      highlighted: useFilterRef<"highlighted", typeof ExperiencesFiltersObj>(),
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
              inputIsLoading={Object.keys(pendingFilters).includes("skills")}
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
              inputIsLoading={Object.keys(pendingFilters).includes("companies")}
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
        {
          id: "highlighted",
          label: "Highlighted",
          isHiddenByDefault: false,
          tooltipLabel: v =>
            ({
              null: "Show Highlighted",
              true: "Show Unhighlighted",
              false: "Show All",
            })[String(v)],
          renderer: (v: boolean | null, { params, ref }) => (
            <HighlightedFilterButton
              {...params}
              ref={instance => {
                refs.highlighted.current = instance;
                ref?.(instance);
              }}
              initialValue={v}
              onChange={highlighted => updateFilters({ highlighted })}
            />
          ),
        },
        {
          id: "visible",
          label: "Visible",
          isHiddenByDefault: false,
          tooltipLabel: v =>
            ({
              null: "Show Visible",
              true: "Show Invisible",
              false: "Show All",
            })[String(v)],
          renderer: (v: boolean | null, { params, ref }) => (
            <VisibleFilterButton
              {...params}
              ref={instance => {
                refs.visible.current = instance;
                ref?.(instance);
              }}
              initialValue={v}
              onChange={visible => updateFilters({ visible })}
            />
          ),
        },
      ]}
    >
      {children}
    </TableView.FilterBar>
  );
};
