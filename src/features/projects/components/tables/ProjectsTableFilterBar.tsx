"use client";
import { useRef } from "react";

import type { ApiSkill, ApiRepository } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { ProjectsFiltersObj } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks";

export interface ProjectsTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly repositories: ApiRepository<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof ProjectsFiltersObj>[];
}

export const ProjectsTableFilterBar = ({
  excludeFilters = [],
  repositories,
  skills,
  ...props
}: ProjectsTableFilterBarProps): JSX.Element => {
  const { filters, refs, pendingFilters, clear, updateFilters } = useFilters(ProjectsFiltersObj, {
    repositories: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
    search: useRef<HTMLInputElement | null>(null),
    visible: useRef<HTMLInputElement | null>(null),
    highlighted: useRef<HTMLInputElement | null>(null),
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchInputRef={refs.search}
      searchPlaceholder="Search projects..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_PROJECT}
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
              isLoading={Object.keys(pendingFilters).includes("skills")}
              popoverClassName="z-50"
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
          id: "repositories",
          label: "Repositories",
          renderer: v => (
            <RepositorySelect
              ref={refs.repositories}
              isLoading={Object.keys(pendingFilters).includes("repositories")}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Repositories"
              data={repositories}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(repositories: string[]) => updateFilters({ repositories })}
              onClear={() => updateFilters({ repositories: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
      ]}
    />
  );
};
