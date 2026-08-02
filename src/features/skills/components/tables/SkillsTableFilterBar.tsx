'use client';
import { type JSX } from 'react';

import {
  type ApiEducation,
  type ApiExperience,
  type ApiProject,
  type ApiRepository,
  type ProgrammingDomain,
  type ProgrammingLanguage,
  type SkillCategory,
} from '~/database/model';
import { type FilterFieldName } from '~/lib/filters';

import { SkillsFiltersObj } from '~/actions';

import { HighlightedFilterButton } from '~/components/buttons/HighlightedFilterButton';
import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { EducationSelect } from '~/features/educations/components/input/EducationSelect';
import { ExperienceSelect } from '~/features/experiences/components/input/ExperienceSelect';
import { ProjectSelect } from '~/features/projects/components/input/ProjectSelect';
import { RepositorySelect } from '~/features/repositories/components/input/RepositorySelect';
import { ProgrammingDomainSelect } from '~/features/skills/components/input/ProgrammingDomainSelect';
import { ProgrammingLanguageSelect } from '~/features/skills/components/input/ProgrammingLanguageSelect';
import { SkillCategorySelect } from '~/features/skills/components/input/SkillCategorySelect';
import { useFilterRef, useFilters } from '~/hooks';

export interface SkillsTableFilterBarProps extends ComponentProps {
  readonly educations: ApiEducation<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof SkillsFiltersObj>[];
  readonly experiences: ApiExperience<[]>[];
  readonly isSearchable?: boolean;
  readonly projects: ApiProject<[]>[];
  readonly repositories: ApiRepository<[]>[];
}

export const SkillsTableFilterBar = ({
  educations,
  excludeFilters = [],
  experiences,
  projects,
  repositories,
  ...props
}: SkillsTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(SkillsFiltersObj, {
    categories: useFilterRef<'categories', typeof SkillsFiltersObj>(),
    educations: useFilterRef<'educations', typeof SkillsFiltersObj>(),
    experiences: useFilterRef<'experiences', typeof SkillsFiltersObj>(),
    highlighted: useFilterRef<'highlighted', typeof SkillsFiltersObj>(),
    prioritized: useFilterRef<'prioritized', typeof SkillsFiltersObj>(),
    programmingDomains: useFilterRef<'programmingDomains', typeof SkillsFiltersObj>(),
    programmingLanguages: useFilterRef<'programmingLanguages', typeof SkillsFiltersObj>(),
    projects: useFilterRef<'projects', typeof SkillsFiltersObj>(),
    repositories: useFilterRef<'repositories', typeof SkillsFiltersObj>(),
    search: useFilterRef<'search', typeof SkillsFiltersObj>(),
    visible: useFilterRef<'visible', typeof SkillsFiltersObj>(),
  });

  return (
    <TableView.FilterBar
      {...props}
      configuration={[
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
          id: 'experiences',
          label: 'Experiences',
          renderer: v => (
            <ExperienceSelect
              behavior='multi'
              data={experiences}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('experiences')}
              maximumValuesToRender={1}
              onChange={(selectedExperiences: string[]) =>
                updateFilters({ experiences: selectedExperiences })
              }
              onClear={() => updateFilters({ experiences: [] })}
              placeholder='Experiences'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.experiences}
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
              hasDynamicHeight={false}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('educations')}
              maximumValuesToRender={1}
              onChange={(selectedEducations: string[]) =>
                updateFilters({ educations: selectedEducations })
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
          id: 'programmingLanguages',
          isHiddenByDefault: true,
          label: 'Programming Languages',
          renderer: v => (
            <ProgrammingLanguageSelect
              behavior='multi'
              hasDynamicHeight={false}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('programmingLanguages')}
              maximumValuesToRender={1}
              onChange={(programmingLanguages: ProgrammingLanguage[]) =>
                updateFilters({ programmingLanguages })
              }
              onClear={() => updateFilters({ programmingLanguages: [] })}
              placeholder='Prog. Languages'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.programmingLanguages}
            />
          ),
        },
        {
          id: 'programmingDomains',
          isHiddenByDefault: true,
          label: 'Programming Domains',
          renderer: v => (
            <ProgrammingDomainSelect
              behavior='multi'
              hasDynamicHeight={false}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('programmingDomains')}
              maximumValuesToRender={1}
              onChange={(programmingDomains: ProgrammingDomain[]) =>
                updateFilters({ programmingDomains })
              }
              onClear={() => updateFilters({ programmingDomains: [] })}
              placeholder='Prog. Domains'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.programmingDomains}
            />
          ),
        },
        {
          id: 'categories',
          isHiddenByDefault: true,
          label: 'Categories',
          renderer: v => (
            <SkillCategorySelect
              behavior='multi'
              hasDynamicHeight={false}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('categories')}
              maximumValuesToRender={1}
              onChange={(categories: SkillCategory[]) => updateFilters({ categories })}
              onClear={() => updateFilters({ categories: [] })}
              placeholder='Categories'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.categories}
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
      newDrawerId={DrawerIds.CREATE_SKILL}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search skills...'
    />
  );
};
