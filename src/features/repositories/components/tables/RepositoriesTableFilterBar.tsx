"use client";
import { useRef } from "react";

import { type ApiSkill, type ApiProject } from "~/database/model";
import { type FilterFieldName } from "~/lib/filters";

import { RepositoriesFiltersObj } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks";

import { SyncRepositoriesButton } from "./SyncRepositoriesButton";

export interface RepositoriesTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly projects: ApiProject<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof RepositoriesFiltersObj>[];
}

export const RepositoriesTableFilterBar = ({
  excludeFilters = [],
  projects,
  skills,
  ...props
}: RepositoriesTableFilterBarProps): JSX.Element => {
  const { filters, refs, pendingFilters, clear, updateFilters } = useFilters(
    RepositoriesFiltersObj,
    {
      projects: useRef<SelectInstance<string, "multi"> | null>(null),
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
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchInputRef={refs.search}
      searchPlaceholder="Search repositories..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_REPOSITORY}
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
              inputClassName="max-w-[320px]"
              placeholder="Skills"
              isLoading={Object.keys(pendingFilters).includes("skills")}
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
          id: "projects",
          label: "Projects",
          renderer: v => (
            <ProjectSelect
              ref={refs.projects}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Projects"
              isLoading={Object.keys(pendingFilters).includes("projects")}
              data={projects}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(projects: string[]) => updateFilters({ projects })}
              onClear={() => updateFilters({ projects: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
      ]}
    >
      <SyncRepositoriesButton />
    </TableView.FilterBar>
  );
};
