"use client";
import { useEffect, useRef, useCallback } from "react";

import type {
  ApiEducation,
  ApiExperience,
  ApiProject,
  ApiRepository,
  SkillCategory,
  ProgrammingDomain,
  ProgrammingLanguage,
} from "~/database/model";

import { SkillsFiltersObj, type SkillsFilters } from "~/actions-v2";

import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables-v2/TableView";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { ExperienceSelect } from "~/features/experiences/components/input/ExperienceSelect";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { ProgrammingDomainSelect } from "~/features/skills/components/input/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<keyof SkillsFilters, "search" | "includeInTopSkills">;

export interface SkillsTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly educations: ApiEducation<[]>[];
  readonly experiences: ApiExperience<[]>[];
  readonly projects: ApiProject<[]>[];
  readonly repositories: ApiRepository<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly filters: SkillsFilters;
}

type FilterRefs = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key in SelectFilterField]: React.MutableRefObject<any>;
};

const useFilterRefs = ({ filters }: { filters: SkillsFilters }) => {
  const refs = useRef<FilterRefs>({
    experiences: useRef<SelectInstance<string, "multi"> | null>(null),
    educations: useRef<SelectInstance<string, "multi"> | null>(null),
    projects: useRef<SelectInstance<string, "multi"> | null>(null),
    repositories: useRef<SelectInstance<string, "multi"> | null>(null),
    programmingDomains: useRef<SelectInstance<ProgrammingDomain, "multi"> | null>(null),
    programmingLanguages: useRef<SelectInstance<ProgrammingLanguage, "multi"> | null>(null),
    categories: useRef<SelectInstance<SkillCategory, "multi"> | null>(null),
  });

  const clear = useCallback(() => {
    for (const ref of Object.values(refs.current)) {
      ref.current?.clear();
    }
  }, []);

  const sync = useCallback((filts: SkillsFilters) => {
    for (const [field, ref] of Object.entries(refs.current)) {
      if (ref.current) {
        const f = field as SelectFilterField;
        const v = filts[f];
        const setter = ref.current.setValue as (v: SkillsFilters[typeof f]) => void;
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

export const SkillsTableFilterBar = ({
  excludeFilters = [],
  filters,
  experiences,
  educations,
  projects,
  repositories,
  ...props
}: SkillsTableFilterBarProps): JSX.Element => {
  const { refs, clear } = useFilterRefs({ filters });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [, updateFilters] = useFilters({
    filters: SkillsFiltersObj,
  });

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = filters.search;
    }
  }, [filters]);

  return (
    <TableView.FilterBar
      {...props}
      searchInputRef={searchInputRef}
      searchPlaceholder="Search skills..."
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({ experiences: [], educations: [], search: "" });
      }}
    >
      <ShowHide show={!excludeFilters.includes("projects")}>
        <ProjectSelect
          ref={refs.projects}
          popoverClassName="z-50"
          inputClassName="max-w-[320px]"
          placeholder="Projects"
          data={projects}
          behavior="multi"
          isClearable
          maximumValuesToRender={1}
          initialValue={filters.projects}
          onChange={(projects: string[]) => updateFilters({ projects })}
          onClear={() => updateFilters({ projects: [] })}
          menuPlacement="bottom"
        />
      </ShowHide>
      <ShowHide show={!excludeFilters.includes("repositories")}>
        <RepositorySelect
          ref={refs.repositories}
          popoverClassName="z-50"
          inputClassName="max-w-[320px]"
          placeholder="Repositories"
          data={repositories}
          behavior="multi"
          isClearable
          maximumValuesToRender={1}
          initialValue={filters.repositories}
          onChange={(repositories: string[]) => updateFilters({ repositories })}
          onClear={() => updateFilters({ repositories: [] })}
          menuPlacement="bottom"
        />
      </ShowHide>
      <ShowHide show={!excludeFilters.includes("experiences")}>
        <ExperienceSelect
          ref={refs.experiences}
          popoverClassName="z-50"
          inputClassName="max-w-[320px]"
          placeholder="Experiences"
          data={experiences}
          behavior="multi"
          isClearable
          maximumValuesToRender={1}
          initialValue={filters.experiences}
          onChange={(experiences: string[]) => updateFilters({ experiences })}
          onClear={() => updateFilters({ experiences: [] })}
          menuPlacement="bottom"
        />
      </ShowHide>
      <ShowHide show={!excludeFilters.includes("educations")}>
        <EducationSelect
          ref={refs.educations}
          popoverClassName="z-50"
          placeholder="Educations"
          data={educations}
          behavior="multi"
          isClearable
          initialValue={filters.educations}
          maximumValuesToRender={1}
          dynamicHeight={false}
          inputClassName="max-w-[320px]"
          onChange={(educations: string[]) => updateFilters({ educations })}
          onClear={() => updateFilters({ educations: [] })}
          menuPlacement="bottom"
        />
      </ShowHide>
    </TableView.FilterBar>
  );
};
