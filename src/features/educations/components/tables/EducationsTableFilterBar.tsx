"use client";
import { type ReactNode, useRef } from "react";

import { type ApiSkill, type Degree, type ApiCourse, type ApiSchool } from "~/database/model";

import { EducationsFiltersObj, type EducationsFilters } from "~/actions";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { CourseSelect } from "~/features/courses/components/input/CourseSelect";
import { DegreeSelect } from "~/features/educations/components/input/DegreeSelect";
import { SchoolSelect } from "~/features/schools/components/input/SchoolSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<
  keyof EducationsFilters,
  "search" | "highlighted" | "visible" | "postPoned"
>;

export interface EducationsTableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly schools: ApiSchool<[]>[];
  readonly courses: ApiCourse<[]>[];
  readonly excludeFilters?: SelectFilterField[];
}

export const EducationsTableFilterBar = ({
  excludeFilters = [],
  schools,
  courses,
  children,
  skills,
  ...props
}: EducationsTableFilterBarProps): JSX.Element => {
  const { filters, refs, pendingFilters, clear, updateFilters } = useFilters(EducationsFiltersObj, {
    schools: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
    courses: useRef<SelectInstance<string, "multi"> | null>(null),
    degrees: useRef<SelectInstance<Degree, "multi"> | null>(null),
    search: useRef<HTMLInputElement | null>(null),
    visible: useRef<HTMLInputElement | null>(null),
    highlighted: useRef<HTMLInputElement | null>(null),
    postPoned: useRef<HTMLInputElement | null>(null),
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchPending={Object.keys(pendingFilters).includes("search")}
      searchInputRef={refs.search}
      searchPlaceholder="Search educations..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_EDUCATION}
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
          id: "schools",
          label: "Schools",
          renderer: v => (
            <SchoolSelect
              ref={refs.schools}
              isLoading={Object.keys(pendingFilters).includes("schools")}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Schools"
              data={schools}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(schools: string[]) => updateFilters({ schools })}
              onClear={() => updateFilters({ schools: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "courses",
          label: "Courses",
          renderer: v => (
            <CourseSelect
              ref={refs.courses}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Courses"
              data={courses}
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(courses: string[]) => updateFilters({ courses })}
              onClear={() => updateFilters({ courses: [] })}
              popoverPlacement="bottom"
            />
          ),
        },
        {
          id: "degrees",
          label: "Degrees",
          renderer: v => (
            <DegreeSelect
              ref={refs.degrees}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Degrees"
              behavior="multi"
              isClearable
              maximumValuesToRender={1}
              initialValue={v}
              onChange={(degrees: Degree[]) => updateFilters({ degrees })}
              onClear={() => updateFilters({ degrees: [] })}
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
