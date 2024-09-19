"use client";
import { useEffect, useRef, useCallback } from "react";

import type { ApiEducation, ApiExperience } from "~/database/model";

import { SkillsFiltersObj, type SkillsFilters } from "~/actions-v2";

import type { SelectInstance } from "~/components/input/select";
import { TableView } from "~/components/tables-v2/TableView";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { ExperienceSelect } from "~/features/experiences/components/input/ExperienceSelect";
import { useFilters } from "~/hooks/use-filters";

type SelectFilterField = Exclude<keyof SkillsFilters, "search">;

export interface SkillsTableFilterBarProps extends ComponentProps {
  readonly isSearchable?: boolean;
  readonly educations: ApiEducation<[]>[];
  readonly experiences: ApiExperience<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly filters: SkillsFilters;
}

const useFilterRefs = ({ filters }: { filters: SkillsFilters }) => {
  const refs = useRef({
    experiences: useRef<SelectInstance<string, "multi"> | null>(null),
    educations: useRef<SelectInstance<string, "multi"> | null>(null),
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
      <ShowHide show={!excludeFilters.includes("experiences")}>
        <ExperienceSelect
          ref={refs.experiences}
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
