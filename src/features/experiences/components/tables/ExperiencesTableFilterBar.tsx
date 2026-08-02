'use client';
import { type JSX, type ReactNode } from 'react';

import { type ApiCompany, type ApiSkill } from '~/database/model';
import { type FilterFieldName } from '~/lib/filters';

import { ExperiencesFiltersObj } from '~/actions';

import { HighlightedFilterButton } from '~/components/buttons/HighlightedFilterButton';
import { VisibleFilterButton } from '~/components/buttons/VisibleFilterButton';
import { DrawerIds } from '~/components/drawers';
import { TableView } from '~/components/tables/TableView';
import { type ComponentProps } from '~/components/types';
import { CompanySelect } from '~/features/companies/components/input/CompanySelect';
import { SkillsSelect } from '~/features/skills/components/input/SkillsSelect';
import { useFilterRef, useFilters } from '~/hooks';

export interface ExperiencesTableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly companies: ApiCompany<[]>[];
  readonly excludeFilters?: FilterFieldName<typeof ExperiencesFiltersObj>[];
  readonly isSearchable?: boolean;
  readonly skills: ApiSkill<[]>[];
}

export const ExperiencesTableFilterBar = ({
  children,
  companies,
  excludeFilters = [],
  skills,
  ...props
}: ExperiencesTableFilterBarProps): JSX.Element => {
  const { clear, filters, pendingFilters, refs, updateFilters } = useFilters(
    ExperiencesFiltersObj,
    {
      companies: useFilterRef<'companies', typeof ExperiencesFiltersObj>(),
      highlighted: useFilterRef<'highlighted', typeof ExperiencesFiltersObj>(),
      search: useFilterRef<'search', typeof ExperiencesFiltersObj>(),
      skills: useFilterRef<'skills', typeof ExperiencesFiltersObj>(),
      visible: useFilterRef<'visible', typeof ExperiencesFiltersObj>(),
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
          id: 'companies',
          label: 'Companies',
          renderer: v => (
            <CompanySelect
              behavior='multi'
              data={companies}
              initialValue={v}
              inputClassName='max-w-[320px]'
              isClearable
              isInputLoading={Object.keys(pendingFilters).includes('companies')}
              maximumValuesToRender={1}
              onChange={(selectedCompanies: string[]) =>
                updateFilters({ companies: selectedCompanies })
              }
              onClear={() => updateFilters({ companies: [] })}
              placeholder='Companies'
              popoverClassName='z-50'
              popoverPlacement='bottom'
              ref={refs.companies}
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
      newDrawerId={DrawerIds.CREATE_EXPERIENCE}
      onClear={() => clear()}
      onSearch={v => updateFilters({ search: v })}
      search={filters.search}
      searchInputRef={refs.search}
      searchPlaceholder='Search experiences...'
    >
      {children}
    </TableView.FilterBar>
  );
};
