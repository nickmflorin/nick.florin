"use client";
import type { ApiSkill, ApiRepository } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { ProjectsFiltersObj } from "~/actions";

import { HighlightedFilterButton } from "~/components/buttons/HighlightedFilterButton";
import { VisibleFilterButton } from "~/components/buttons/VisibleFilterButton";
import { DrawerIds } from "~/components/drawers";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters, useFilterRef } from "~/hooks";

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
    repositories: useFilterRef<"repositories", typeof ProjectsFiltersObj>(),
    skills: useFilterRef<"skills", typeof ProjectsFiltersObj>(),
    search: useFilterRef<"search", typeof ProjectsFiltersObj>(),
    visible: useFilterRef<"visible", typeof ProjectsFiltersObj>(),
    highlighted: useFilterRef<"highlighted", typeof ProjectsFiltersObj>(),
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
              inputIsLoading={Object.keys(pendingFilters).includes("skills")}
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
              inputIsLoading={Object.keys(pendingFilters).includes("repositories")}
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
    />
  );
};
