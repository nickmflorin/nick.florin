"use client";
import { type ApiSkill, type ApiProject } from "~/database/model";
import { type FilterFieldName } from "~/lib/filters";

import { RepositoriesFiltersObj } from "~/actions";

import { HighlightedFilterButton } from "~/components/buttons/HighlightedFilterButton";
import { VisibleFilterButton } from "~/components/buttons/VisibleFilterButton";
import { DrawerIds } from "~/components/drawers";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters, useFilterRef } from "~/hooks";

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
      projects: useFilterRef<"projects", typeof RepositoriesFiltersObj>(),
      skills: useFilterRef<"skills", typeof RepositoriesFiltersObj>(),
      search: useFilterRef<"search", typeof RepositoriesFiltersObj>(),
      visible: useFilterRef<"visible", typeof RepositoriesFiltersObj>(),
      highlighted: useFilterRef<"highlighted", typeof RepositoriesFiltersObj>(),
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
      <SyncRepositoriesButton />
    </TableView.FilterBar>
  );
};
