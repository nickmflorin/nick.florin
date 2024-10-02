"use client";
import { useRef } from "react";

import { type ApiSkill, type ApiEducation } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { CoursesFiltersObj } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks/use-filters";

export interface CoursesTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly educations: ApiEducation<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof CoursesFiltersObj>[];
}

export const CoursesTableFilterBar = ({
  excludeFilters = [],
  educations,
  skills,
  ...props
}: CoursesTableFilterBarProps): JSX.Element => {
  const { filters, refs, pendingFilters, clear, updateFilters } = useFilters(CoursesFiltersObj, {
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
    educations: useRef<SelectInstance<string, "multi"> | null>(null),
    search: useRef<HTMLInputElement | null>(null),
    visible: useRef<HTMLInputElement | null>(null),
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={refs.search}
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchPlaceholder="Search courses..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_COURSE}
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
          id: "educations",
          label: "Educations",
          renderer: v => (
            <EducationSelect
              ref={refs.educations}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Educations"
              isLoading={Object.keys(pendingFilters).includes("educations")}
              data={educations}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(educations: string[]) => updateFilters({ educations })}
              onClear={() => updateFilters({ educations: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
      ]}
    />
  );
};
