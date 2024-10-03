"use client";
import { type ApiSkill, type ApiEducation } from "~/database/model";
import type { FilterFieldName } from "~/lib/filters";

import { CoursesFiltersObj } from "~/actions";

import { VisibleFilterButton } from "~/components/buttons/VisibleFilterButton";
import { DrawerIds } from "~/components/drawers";
import { TableView } from "~/components/tables/TableView";
import { type ComponentProps } from "~/components/types";
import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";
import { useFilters, useFilterRef } from "~/hooks";

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
    skills: useFilterRef<"skills", typeof CoursesFiltersObj>(),
    educations: useFilterRef<"educations", typeof CoursesFiltersObj>(),
    search: useFilterRef<"search", typeof CoursesFiltersObj>(),
    visible: useFilterRef<"visible", typeof CoursesFiltersObj>(),
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
