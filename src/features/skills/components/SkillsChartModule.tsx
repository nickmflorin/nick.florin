'use client';
import dynamic from 'next/dynamic';

import { arraysHaveSameElements } from '~/lib';

import { Button } from '~/components/buttons';
import { ErrorView } from '~/components/errors/ErrorView';
import { Empty } from '~/components/feedback/Empty';
import { CircleNumber } from '~/components/icons/CircleNumber';
import { DynamicLoader, DynamicLoading } from '~/components/loading/dynamic-loading';
import { Loading } from '~/components/loading/Loading';
import { Module } from '~/components/structural/Module';
import { useFilterState } from '~/hooks';
import { useSkills } from '~/hooks/api';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

import { type SkillsChartFilterFormValues } from './forms/SkillsChartFilterForm';
import { SkillsFilterDropdownMenu } from './SkillsFilterDropdownMenu';

const SkillsBarChartView = dynamic(
  () => import('./charts/SkillsBarChartView').then(mod => mod.SkillsBarChartView),
  {
    loading: () => <DynamicLoader />,
  },
);

export const SkillsChartModule = () => {
  const { isLessThan } = useScreenSizes();

  const [filters, setFilters, resetFilters, filtersHaveChanged, differingFilters] =
    useFilterState<SkillsChartFilterFormValues>(
      {
        categories: [],
        educations: [],
        experiences: [],
        programmingDomains: [],
        programmingLanguages: [],
        showTopSkills: 'all',
      },
      {
        categories: arraysHaveSameElements,
        educations: arraysHaveSameElements,
        experiences: arraysHaveSameElements,
        programmingDomains: arraysHaveSameElements,
        programmingLanguages: arraysHaveSameElements,
      },
    );

  const {
    data: skills,
    error,
    isLoading,
  } = useSkills({
    keepPreviousData: true,
    query: {
      ...filters,
      highlighted: true,
      includes: [],
      limit: filters.showTopSkills === 'all' ? undefined : filters.showTopSkills,
      order: 'desc',
      orderBy: 'calculatedExperience',
      visibility: 'public',
    },
  });

  return (
    <>
      <Module.Header
        actions={[
          <SkillsFilterDropdownMenu
            filters={filters}
            hasFiltersChanged={filtersHaveChanged}
            isLoading={isLoading}
            key='0'
            onChange={f => setFilters(f)}
            onClear={() => resetFilters()}
            skills={skills ?? []}
          />,
          <Button.Solid
            className='py-[2px] px-[10px]'
            icon={
              <CircleNumber isActive={differingFilters.length !== 0} size='20px'>
                {differingFilters.length}
              </CircleNumber>
            }
            isDisabled={!filtersHaveChanged}
            key='1'
            onClick={() => resetFilters()}
            scheme='secondary'
            size={isLessThan('md') ? 'xsmall' : 'small'}
          >
            Clear
          </Button.Solid>,
        ]}
        className='!pr-[0px]'
      >
        Skills Overview
      </Module.Header>
      <Module.Content className='xl:overflow-y-auto xl:pr-[16px]'>
        <DynamicLoading>
          {({ isLoading: isLazyLoadingComponent }) => (
            <Loading isLoading={isLoading || isLazyLoadingComponent}>
              <Empty
                content={
                  differingFilters.length === 0
                    ? 'No skills exist.'
                    : 'No skills match the search criteria.'
                }
                isEmpty={skills?.length === 0}
              >
                {error ? (
                  <ErrorView error={error} />
                ) : skills === undefined ? null : (
                  <SkillsBarChartView skills={skills} />
                )}
              </Empty>
            </Loading>
          )}
        </DynamicLoading>
      </Module.Content>
    </>
  );
};
