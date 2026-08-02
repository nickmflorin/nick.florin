'use client';
import { type JSX } from 'react';

import { type ApiProject, type ApiSkill } from '~/database/model';
import { type FilterFieldName } from '~/lib/filters';

import { RepositoriesFiltersObj } from '~/actions';

import { HighlightedFilterButton } from '~/components/buttons/HighlightedFilterButton';
import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { ProjectSelect } from '~/features/projects/components/input/ProjectSelect';
import { SkillsSelect } from '~/features/skills/components/input/SkillsSelect';
import { useFilterRef, useFilters } from '~/hooks';

import { SyncRepositoriesButton } from './SyncRepositoriesButton';

export interface RepositoriesTableFilterBarProps extends ComponentProps {
  readonly excludeFilters?: FilterFieldName<typeof RepositoriesFiltersObj>[];
  readonly isSearchable?: boolean;
  readonly projects: ApiProject<[]>[];
  readonly skills: ApiSkill<[]>[];
}

export const RepositoriesTableFilterBar = ({
  excludeFilters = [],
  projects,
  skills,
  ...props
}: RepositoriesTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(
    RepositoriesFiltersObj,
    {
      highlighted: useFilterRef<'highlighted', typeof RepositoriesFiltersObj>(),
      projects: useFilterRef<'projects', typeof RepositoriesFiltersObj>(),
      search: useFilterRef<'search', typeof RepositoriesFiltersObj>(),
      skills: useFilterRef<'skills', typeof RepositoriesFiltersObj>(),
      visible: useFilterRef<'visible', typeof RepositoriesFiltersObj>(),
    },
  );

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
          id: 'projects',
          label: 'Projects',
          renderer: v => (
            <ProjectSelect
              behavior='multi'
              data={projects}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('projects')}
              maximumValuesToRender={1}
              onChange={(selectedProjects: string[]) =>
                updateFilters({ projects: selectedProjects })
              }
              onClear={() => updateFilters({ projects: [] })}
              placeholder='Projects'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.projects}
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
      newDrawerId={DrawerIds.CREATE_REPOSITORY}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search repositories...'
    >
      <SyncRepositoriesButton />
    </TableView.FilterBar>
  );
};
