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
import { FiltersValues } from "~/lib/filters";

import { SkillsFiltersObj, type SkillsFilters } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { ExperienceSelect } from "~/features/experiences/components/input/ExperienceSelect";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { ProgrammingDomainSelect } from "~/features/skills/components/input/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<
  keyof SkillsFilters,
  "search" | "highlighted" | "prioritized" | "visible"
>;

export interface SkillsTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly educations: ApiEducation<[]>[];
  readonly experiences: ApiExperience<[]>[];
  readonly projects: ApiProject<[]>[];
  readonly repositories: ApiRepository<[]>[];
  readonly excludeFilters?: SelectFilterField[];
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
  experiences,
  educations,
  projects,
  repositories,
  ...props
}: SkillsTableFilterBarProps): JSX.Element => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, updateFilters, { pendingFilters }] = useFilters({
    filters: SkillsFiltersObj,
  });
  const { refs, clear } = useFilterRefs({ filters });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={searchInputRef}
      searchPlaceholder="Search skills..."
      searchPending={Object.keys(pendingFilters).includes("search")}
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_SKILL}
      search={filters.search}
      filters={filters}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({
          experiences: [],
          educations: [],
          search: "",
          programmingDomains: [],
          programmingLanguages: [],
          categories: [],
          projects: [],
          repositories: [],
        });
      }}
      configuration={[
        {
          id: "projects",
          label: "Projects",
          renderer: v => (
            <ProjectSelect
              ref={refs.projects}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Projects"
              data={projects}
              isLoading={Object.keys(pendingFilters).includes("projects")}
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
          id: "repositories",
          label: "Repositories",
          renderer: v => (
            <RepositorySelect
              ref={refs.repositories}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Repositories"
              isLoading={Object.keys(pendingFilters).includes("repositories")}
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
          id: "experiences",
          label: "Experiences",
          renderer: v => (
            <ExperienceSelect
              ref={refs.experiences}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Experiences"
              isLoading={Object.keys(pendingFilters).includes("experiences")}
              data={experiences}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(experiences: string[]) => updateFilters({ experiences })}
              onClear={() => updateFilters({ experiences: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "educations",
          label: "Educations",
          renderer: v => (
            <EducationSelect
              ref={refs.educations}
              popoverClassName="z-50"
              placeholder="Educations"
              isLoading={Object.keys(pendingFilters).includes("educations")}
              data={educations}
              behavior="multi"
              isClearable
              initialValue={v}
              maximumValuesToRender={1}
              dynamicHeight={false}
              inputClassName="max-w-[320px]"
              onChange={(educations: string[]) => updateFilters({ educations })}
              onClear={() => updateFilters({ educations: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "programmingLanguages",
          label: "Programming Languages",
          isHiddenByDefault: true,
          renderer: v => (
            <ProgrammingLanguageSelect
              ref={refs.programmingLanguages}
              popoverClassName="z-50"
              placeholder="Prog. Languages"
              isLoading={Object.keys(pendingFilters).includes("programmingLanguages")}
              behavior="multi"
              isClearable
              initialValue={v}
              maximumValuesToRender={1}
              dynamicHeight={false}
              inputClassName="max-w-[320px]"
              onChange={(programmingLanguages: ProgrammingLanguage[]) =>
                updateFilters({ programmingLanguages })
              }
              onClear={() => updateFilters({ programmingLanguages: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "programmingDomains",
          label: "Programming Domains",
          isHiddenByDefault: true,
          renderer: v => (
            <ProgrammingDomainSelect
              ref={refs.programmingDomains}
              popoverClassName="z-50"
              placeholder="Prog. Domains"
              isLoading={Object.keys(pendingFilters).includes("programmingDomains")}
              behavior="multi"
              isClearable
              initialValue={v}
              maximumValuesToRender={1}
              dynamicHeight={false}
              inputClassName="max-w-[320px]"
              onChange={(programmingDomains: ProgrammingDomain[]) =>
                updateFilters({ programmingDomains })
              }
              onClear={() => updateFilters({ programmingDomains: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "categories",
          label: "Categories",
          isHiddenByDefault: true,
          renderer: v => (
            <SkillCategorySelect
              ref={refs.categories}
              popoverClassName="z-50"
              placeholder="Categories"
              behavior="multi"
              isClearable
              initialValue={v}
              isLoading={Object.keys(pendingFilters).includes("categories")}
              maximumValuesToRender={1}
              dynamicHeight={false}
              inputClassName="max-w-[320px]"
              onChange={(categories: SkillCategory[]) => updateFilters({ categories })}
              onClear={() => updateFilters({ categories: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
      ]}
    />
  );
};
