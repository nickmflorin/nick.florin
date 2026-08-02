'use client';
import { type JSX } from 'react';

import { type ApiEducation, type ApiSkill } from '~/database/model';
import { type FilterFieldName } from '~/lib/filters';

import { CoursesFiltersObj } from '~/actions';

import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { EducationSelect } from '~/features/educations/components/input/EducationSelect';
import { SkillsSelect } from '~/features/skills/components/input/SkillsSelect';
import { useFilterRef, useFilters } from '~/hooks';

export interface CoursesTableFilterBarProps extends ComponentProps {
  readonly educations: ApiEducation<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof CoursesFiltersObj>[];
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
}

export const CoursesTableFilterBar = ({
  educations,
  excludeFilters = [],
  skills,
  ...props
}: CoursesTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(CoursesFiltersObj, {
    educations: useFilterRef<'educations', typeof CoursesFiltersObj>(),
    search: useFilterRef<'search', typeof CoursesFiltersObj>(),
    skills: useFilterRef<'skills', typeof CoursesFiltersObj>(),
    visible: useFilterRef<'visible', typeof CoursesFiltersObj>(),
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
              onChange={(updatedSkills: string[]) => updateFilters({ skills: updatedSkills })}
              onClear={() => updateFilters({ skills: [] })}
              placeholder='Skills'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.skills}
            />
          ),
        },
        {
          id: 'educations',
          label: 'Educations',
          renderer: v => (
            <EducationSelect
              behavior='multi'
              data={educations}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('educations')}
              maximumValuesToRender={1}
              onChange={(updatedEducations: string[]) =>
                updateFilters({ educations: updatedEducations })
              }
              onClear={() => updateFilters({ educations: [] })}
              placeholder='Educations'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.educations}
            />
          ),
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
      newDrawerId={DrawerIds.CREATE_COURSE}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search courses...'
    />
  );
};
