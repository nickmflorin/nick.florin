"use client";
import { useEffect, useRef, useCallback } from "react";

import { type ApiSkill, type Degree, type ApiCourse, type ApiSchool } from "~/database/model";

import { EducationsFiltersObj, type EducationsFilters } from "~/actions-v2";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables-v2/TableView";
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
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly schools: ApiSchool<[]>[];
  readonly courses: ApiCourse<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly filters: EducationsFilters;
}

type FilterRefs = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key in SelectFilterField]: React.MutableRefObject<any>;
};

const useFilterRefs = ({ filters }: { filters: EducationsFilters }) => {
  const refs = useRef<FilterRefs>({
    schools: useRef<SelectInstance<string, "multi"> | null>(null),
    courses: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
    degrees: useRef<SelectInstance<Degree, "multi"> | null>(null),
  });

  const clear = useCallback(() => {
    for (const ref of Object.values(refs.current)) {
      ref.current?.clear();
    }
  }, []);

  const sync = useCallback((filts: EducationsFilters) => {
    for (const [field, ref] of Object.entries(refs.current)) {
      if (ref.current) {
        const f = field as SelectFilterField;
        const v = filts[f];
        const setter = ref.current.setValue as (v: EducationsFilters[typeof f]) => void;
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

export const EducationsTableFilterBar = ({
  excludeFilters = [],
  filters,
  schools,
  courses,
  skills,
  ...props
}: EducationsTableFilterBarProps): JSX.Element => {
  const { refs, clear } = useFilterRefs({ filters });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [, updateFilters] = useFilters({
    filters: EducationsFiltersObj,
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={searchInputRef}
      searchPlaceholder="Search educations..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_EDUCATION}
      search={filters.search}
      filters={filters}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({
          schools: [],
          courses: [],
          degrees: [],
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
          id: "schools",
          label: "Schools",
          renderer: v => (
            <SchoolSelect
              ref={refs.schools}
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
    />
  );
};
