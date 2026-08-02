'use client';
import { type JSX } from 'react';

import { type ApiRepository, type ApiSkill } from '~/database/model';
import { type FilterFieldName } from '~/lib/filters';

import { ProjectsFiltersObj } from '~/actions';

import { HighlightedFilterButton } from '~/components/buttons/HighlightedFilterButton';
import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { RepositorySelect } from '~/features/repositories/components/input/RepositorySelect';
import { SkillsSelect } from '~/features/skills/components/input/SkillsSelect';
import { useFilterRef, useFilters } from '~/hooks';

export interface ProjectsTableFilterBarProps extends ComponentProps {
  readonly excludeFilters?: FilterFieldName<typeof ProjectsFiltersObj>[];
  readonly isSearchable?: boolean;
  readonly repositories: ApiRepository<[]>[];
  readonly skills: ApiSkill<[]>[];
}

export const ProjectsTableFilterBar = ({
  excludeFilters = [],
  repositories,
  skills,
  ...props
}: ProjectsTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(ProjectsFiltersObj, {
    highlighted: useFilterRef<'highlighted', typeof ProjectsFiltersObj>(),
    repositories: useFilterRef<'repositories', typeof ProjectsFiltersObj>(),
    search: useFilterRef<'search', typeof ProjectsFiltersObj>(),
    skills: useFilterRef<'skills', typeof ProjectsFiltersObj>(),
    visible: useFilterRef<'visible', typeof ProjectsFiltersObj>(),
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
          id: 'repositories',
          label: 'Repositories',
          renderer: v => (
            <RepositorySelect
              behavior='multi'
              data={repositories}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('repositories')}
              maximumValuesToRender={1}
              onChange={(selectedRepositories: string[]) =>
                updateFilters({ repositories: selectedRepositories })
              }
              onClear={() => updateFilters({ repositories: [] })}
              placeholder='Repositories'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.repositories}
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
      newDrawerId={DrawerIds.CREATE_PROJECT}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search projects...'
    />
  );
};
