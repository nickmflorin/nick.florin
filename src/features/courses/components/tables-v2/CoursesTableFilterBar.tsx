"use client";
import { useEffect, useRef, useCallback } from "react";

import { type ApiSkill, type ApiEducation } from "~/database/model";

import { CoursesFiltersObj, type CoursesFilters } from "~/actions-v2";

import { DrawerIds } from "~/components/drawers";
import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables-v2/TableView";
import { type ComponentProps } from "~/components/types";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<keyof CoursesFilters, "search" | "visible">;

export interface CoursesTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly educations: ApiEducation<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly filters: CoursesFilters;
}

type FilterRefs = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key in SelectFilterField]: React.MutableRefObject<any>;
};

const useFilterRefs = ({ filters }: { filters: CoursesFilters }) => {
  const refs = useRef<FilterRefs>({
    educations: useRef<SelectInstance<string, "multi"> | null>(null),
    skills: useRef<SelectInstance<string, "multi"> | null>(null),
  });

  const clear = useCallback(() => {
    for (const ref of Object.values(refs.current)) {
      ref.current?.clear();
    }
  }, []);

  const sync = useCallback((filts: CoursesFilters) => {
    for (const [field, ref] of Object.entries(refs.current)) {
      if (ref.current) {
        const f = field as SelectFilterField;
        const v = filts[f];
        const setter = ref.current.setValue as (v: CoursesFilters[typeof f]) => void;
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

export const CoursesTableFilterBar = ({
  excludeFilters = [],
  filters,
  educations,
  skills,
  ...props
}: CoursesTableFilterBarProps): JSX.Element => {
  const { refs, clear } = useFilterRefs({ filters });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [, updateFilters] = useFilters({
    filters: CoursesFiltersObj,
  });

  return (
    <TableView.FilterBar
      {...props}
      excludeFilters={excludeFilters}
      searchInputRef={searchInputRef}
      searchPlaceholder="Search courses..."
      onSearch={v => updateFilters({ search: v })}
      newDrawerId={DrawerIds.CREATE_COURSE}
      search={filters.search}
      filters={filters}
      onClear={() => {
        clear();
        /* TODO: Establish more of an Object-Oriented pattern for our "Filters" object, for each
           specific model, and expose an attribute on the object 'emptyFilters' that can be used
           to reset the value here. */
        updateFilters({
          educations: [],
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
          id: "educations",
          label: "Educations",
          renderer: v => (
            <EducationSelect
              ref={refs.educations}
              popoverClassName="z-50"
              inputClassName="max-w-[320px]"
              placeholder="Schools"
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
