"use client";
import { useEffect, useRef, useCallback } from "react";

import type { ApiSkill, ApiRepository } from "~/database/model";

import { ProjectsFiltersObj, type ProjectsFilters } from "~/actions-v2";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables-v2/TableView";
import { type ComponentProps } from "~/components/types";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<keyof ProjectsFilters, "search" | "highlighted" | "visible">;

export interface ProjectsTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly repositories: ApiRepository<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly filters: ProjectsFilters;
}

type FilterRefs = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key in SelectFilterField]: React.MutableRefObject<any>;
};

const useFilterRefs = ({ filters }: { filters: ProjectsFilters }) => {
  const refs = useRef<FilterRefs>({
    repositories: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
  });

  const clear = useCallback(() => {
    for (const ref of Object.values(refs.current)) {
      ref.current?.clear();
    }
  }, []);

  const sync = useCallback((filts: ProjectsFilters) => {
    for (const [field, ref] of Object.entries(refs.current)) {
      if (ref.current) {
        const f = field as SelectFilterField;
        const v = filts[f];
        const setter = ref.current.setValue as (v: ProjectsFilters[typeof f]) => void;
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

export const ProjectsTableFilterBar = ({
  excludeFilters = [],
  filters,
  repositories,
  skills,
  ...props
}: ProjectsTableFilterBarProps): JSX.Element => {
  const { refs, clear } = useFilterRefs({ filters });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [, updateFilters] = useFilters({
    filters: ProjectsFiltersObj,
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={searchInputRef}
      searchPlaceholder="Search projects..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_PROJECT}
      search={filters.search}
      filters={filters}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({
          repositories: [],
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
