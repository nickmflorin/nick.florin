'use client';
import { type JSX, type ReactNode } from 'react';

import { type ApiCourse, type ApiSchool, type ApiSkill, type DegreeType } from '~/database/model';

import { type EducationsFilters, EducationsFiltersObj } from '~/actions';

import { HighlightedFilterButton } from '~/components/buttons/HighlightedFilterButton';
import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { CourseSelect } from '~/features/courses/components/input/CourseSelect';
import { DegreeSelect } from '~/features/educations/components/input/DegreeSelect';
import { SchoolSelect } from '~/features/schools/components/input/SchoolSelect';
import { SkillsSelect } from '~/features/skills/components/input/SkillsSelect';
import { useFilterRef, useFilters } from '~/hooks';

type SelectFilterField = Exclude<
  keyof EducationsFilters,
  'highlighted' | 'postPoned' | 'search' | 'visible'
>;

export interface EducationsTableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly courses: ApiCourse<[]>[];
  readonly excludeFilters?: SelectFilterField[];
  readonly isSearchable?: boolean;
  readonly schools: ApiSchool<[]>[];
  readonly skills: ApiSkill<[]>[];
}

export const EducationsTableFilterBar = ({
  children,
  courses,
  excludeFilters = [],
  schools,
  skills,
  ...props
}: EducationsTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(EducationsFiltersObj, {
    courses: useFilterRef<'courses', typeof EducationsFiltersObj>(),
    degrees: useFilterRef<'degrees', typeof EducationsFiltersObj>(),
    highlighted: useFilterRef<'highlighted', typeof EducationsFiltersObj>(),
    postPoned: useFilterRef<'postPoned', typeof EducationsFiltersObj>(),
    schools: useFilterRef<'schools', typeof EducationsFiltersObj>(),
    search: useFilterRef<'search', typeof EducationsFiltersObj>(),
    skills: useFilterRef<'skills', typeof EducationsFiltersObj>(),
    visible: useFilterRef<'visible', typeof EducationsFiltersObj>(),
  });

  return (
    <TableView.FilterBar
      {...props}
      configuration={[
        {
          id: 'skills',
          label: 'Skills',
          renderer: v => (
            <SkillsSelect
              behavior='multi'
              data={skills}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('skills')}
              maximumValuesToRender={1}
              onChange={(selectedSkills: string[]) => updateFilters({ skills: selectedSkills })}
              onClear={() => updateFilters({ skills: [] })}
              placeholder='Skills'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.skills}
            />
          ),
        },
        {
          id: 'schools',
          label: 'Schools',
          renderer: v => (
            <SchoolSelect
              behavior='multi'
              data={schools}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('schools')}
              maximumValuesToRender={1}
              onChange={(selectedSchools: string[]) => updateFilters({ schools: selectedSchools })}
              onClear={() => updateFilters({ schools: [] })}
              placeholder='Schools'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.schools}
            />
          ),
        },
        {
          id: 'courses',
          label: 'Courses',
          renderer: v => (
            <CourseSelect
              behavior='multi'
              data={courses}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              maximumValuesToRender={1}
              onChange={(selectedCourses: string[]) => updateFilters({ courses: selectedCourses })}
              onClear={() => updateFilters({ courses: [] })}
              placeholder='Courses'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.courses}
            />
          ),
        },
        {
          id: 'degrees',
          label: 'Degrees',
          renderer: v => (
            <DegreeSelect
              behavior='multi'
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              maximumValuesToRender={1}
              onChange={(degrees: DegreeType[]) => updateFilters({ degrees })}
              onClear={() => updateFilters({ degrees: [] })}
              placeholder='Degrees'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.degrees}
            />
          ),
        },
        {
          id: 'highlighted',
          isHiddenByDefault: false,
          label: 'Highlighted',
          renderer: (v: boolean | null, { params, ref }) => (
            <HighlightedFilterButton
              {...params}
              initialValue={v}
              onChange={highlighted => updateFilters({ highlighted })}
              ref={instance => {
                refs.highlighted.current = instance;
                ref?.(instance);
              }}
            />
          ),
          tooltipLabel: v =>
            ({
              false: 'Show All',
              null: 'Show Highlighted',
              true: 'Show Unhighlighted',
            })[String(v)],
        },
        {
          id: 'visible',
          isHiddenByDefault: false,
          label: 'Visible',
          renderer: (v: boolean | null, { params, ref }) => (
            <VisibleFilterButton
              {...params}
              initialValue={v}
              onChange={visible => updateFilters({ visible })}
              ref={instance => {
                refs.visible.current = instance;
                ref?.(instance);
              }}
            />
          ),
          tooltipLabel: v =>
            ({
              false: 'Show All',
              null: 'Show Visible',
              true: 'Show Invisible',
            })[String(v)],
        },
      ]}
      excludeFilters={excludeFilters}
      filters={filters}
      isSearchPending={Object.keys(pendingFilters).includes('search')}
      newDrawerId={DrawerIds.CREATE_EDUCATION}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search educations...'
    >
      {children}
    </TableView.FilterBar>
  );
};
