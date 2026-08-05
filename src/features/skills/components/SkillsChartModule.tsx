'use client';
import dynamic from 'next/dynamic';

import { type ApiSkill } from '~/database/model';
import { arraysHaveSameElements } from '~/lib';

import { Button } from '~/components/buttons';
import { ErrorView } from '~/components/errors/ErrorView';
import { Empty } from '~/components/feedback/Empty';
import { CircleNumber } from '~/components/icons/CircleNumber';
import { Loading } from '~/components/loading/Loading';
import { Module } from '~/components/structural/Module';
import { useFilterState } from '~/hooks';
import { useSkills } from '~/hooks/api';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

import { SkillsBarChartSkeleton } from './charts/SkillsBarChartSkeleton';
import { type SkillsChartFilterFormValues } from './forms/SkillsChartFilterForm';
import { SkillsFilterDropdownMenu } from './SkillsFilterDropdownMenu';

const loadSkillsBarChartView = () => import('./charts/SkillsBarChartView');

/* The chart chunk (Nivo included) is kicked off as soon as this module evaluates on the client —
   in parallel with hydration — rather than when the dynamic component first renders, which
   shortens the time until the chart can draw. */
void loadSkillsBarChartView();

/* The chunk-loading fallback is the same skeleton the view renders until it has mounted, so every
   pre-chart state — streamed slot fallback, chunk load, pre-mount render — is pixel-identical. */
const SkillsBarChartView = dynamic(
  () => loadSkillsBarChartView().then(mod => mod.SkillsBarChartView),
  {
    loading: () => <SkillsBarChartSkeleton />,
  },
);

export interface SkillsChartModuleProps {
  /**
   * The skills matching the module's default (unmodified) filters, fetched on the server so that
   * the chart is present in the server-rendered HTML rather than popping in after hydration and
   * the initial SWR fetch. Seeds SWR as `fallbackData`; filter changes refetch client-side.
   */
  readonly initialSkills: ApiSkill<[]>[];
}

export const SkillsChartModule = ({ initialSkills }: SkillsChartModuleProps) => {
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
    isRefetching,
  } = useSkills({
    fallbackData: initialSkills,
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
      <Module.Content className='xl:overflow-y-auto min-h-0 pr-[16px]'>
        {/* The overlay spinner is gated on refetches (filter changes), not the initial load: SWR
            reports `isLoading` while revalidating the server-seeded fallback data on mount, and a
            spinner over the skeleton would double up the loading indication. */}
        <Loading isLoading={isRefetching}>
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
      </Module.Content>
    </>
  );
};
