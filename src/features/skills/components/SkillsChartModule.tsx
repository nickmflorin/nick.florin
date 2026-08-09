'use client';
import dynamic from 'next/dynamic';
import { memo, useCallback, useDeferredValue, useTransition } from 'react';

import { type ApiSkill } from '~/database/model';
import { arraysHaveSameElements } from '~/lib';

import { Button } from '~/components/buttons';
import { ErrorView } from '~/components/errors/ErrorView';
import { Empty } from '~/components/feedback/Empty';
import { CircleNumber } from '~/components/icons/CircleNumber';
import { Loading } from '~/components/loading/Loading';
import { Module } from '~/components/structural/Module';
import { type EducationSelectModel } from '~/features/educations/components/input/EducationSelect';
import { type ExperienceSelectModel } from '~/features/experiences/components/input/ExperienceSelect';
import { useFilterState } from '~/hooks';
import { useSkills } from '~/hooks/api';

import { SkillsBarChartSkeleton } from './charts/SkillsBarChartSkeleton';
import { type SkillsChartFilterFormValues } from './forms/SkillsChartFilterForm';
import { SkillsFilterDropdownMenu } from './SkillsFilterDropdownMenu';

const loadSkillsBarChartView = () => import('./charts/SkillsBarChartView');

/* The chart chunk (Nivo included) is kicked off as soon as this module evaluates on the client —
   in parallel with hydration — rather than when the dynamic component first renders, which
   shortens the time until the chart can draw. */
void loadSkillsBarChartView();

/* The chunk-loading fallback is the same skeleton the view renders until it has mounted, so every
   pre-chart state — streamed slot fallback, chunk load, pre-mount render — is pixel-identical.

   The view is memoized so that urgent renders — a filter interaction, or the render in which SWR
   swaps `data` while `useDeferredValue` still returns the previous skills — bail out of the Nivo
   subtree entirely; the chart redraws only in the deferred render that carries the new data. */
const SkillsBarChartView = memo(
  dynamic(() => loadSkillsBarChartView().then(mod => mod.SkillsBarChartView), {
    loading: () => <SkillsBarChartSkeleton />,
  }),
);

export interface SkillsChartModuleProps {
  /**
   * The education options for the filter form's educations select, started by the `@chart` server
   * page without being awaited so the query runs ahead of any interaction and resolves over the
   * page's own RSC stream. `null` indicates the server read failed.
   */
  readonly educationsPromise: Promise<EducationSelectModel[] | null>;
  /**
   * The experience options for the filter form's experiences select, with the same contract as
   * `educationsPromise`.
   */
  readonly experiencesPromise: Promise<ExperienceSelectModel[] | null>;
  /**
   * The skills matching the module's default (unmodified) filters, fetched on the server so that
   * the chart is present in the server-rendered HTML rather than popping in after hydration and
   * the initial SWR fetch. Seeds SWR as `fallbackData`; filter changes refetch client-side.
   */
  readonly initialSkills: ApiSkill<[]>[];
}

export const SkillsChartModule = ({
  educationsPromise,
  experiencesPromise,
  initialSkills,
}: SkillsChartModuleProps) => {
  /* Filter changes are applied inside a transition so the interaction that produced them — a
     checkbox toggling in the filter menu — paints at urgent priority, while the module re-render
     they trigger (and the chart redraw it contains) is non-urgent and interruptible. */
  const [isPending, startTransition] = useTransition();

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

  /* SWR swaps `data` in its own state update, outside the transition above, so the arrival of a
     response would otherwise redraw the chart at urgent priority. Deferring the value the chart
     renders from keeps that redraw in a background render that input interactions can interrupt. */
  const deferredSkills = useDeferredValue(skills);

  /* Stable identities matter beyond re-render hygiene: the popover and drawer debounce their
     change propagation, and their debounce instances are keyed on the handler they wrap - a new
     identity mid-window would orphan the pending timer along with its flush/cancel controls. */
  const handleFiltersChange = useCallback(
    (values: SkillsChartFilterFormValues) => startTransition(() => setFilters(values)),
    [setFilters, startTransition],
  );

  const handleFiltersClear = useCallback(
    () => startTransition(() => resetFilters()),
    [resetFilters, startTransition],
  );

  return (
    <>
      <Module.Header
        actions={[
          <SkillsFilterDropdownMenu
            educationsPromise={educationsPromise}
            experiencesPromise={experiencesPromise}
            filters={filters}
            hasFiltersChanged={filtersHaveChanged}
            isLoading={isLoading}
            key='0'
            onChange={handleFiltersChange}
            onClear={handleFiltersClear}
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
            onClick={handleFiltersClear}
            scheme='secondary'
            size={{ base: 'xsmall', md: 'small' }}
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
            spinner over the skeleton would double up the loading indication. `isPending` covers
            the transition window between a filter interaction and SWR reporting the refetch. */}
        <Loading isLoading={isPending || isRefetching}>
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
            ) : deferredSkills === undefined ? null : (
              <SkillsBarChartView skills={deferredSkills} />
            )}
          </Empty>
        </Loading>
      </Module.Content>
    </>
  );
};
