"use client";
import dynamic from "next/dynamic";

import { arraysHaveSameElements } from "~/lib";

import { Button } from "~/components/buttons";
import { ErrorView } from "~/components/errors/ErrorView";
import { Empty } from "~/components/feedback/Empty";
import { CircleNumber } from "~/components/icons/CircleNumber";
import { DynamicLoader, DynamicLoading } from "~/components/loading/dynamic-loading";
import { Loading } from "~/components/loading/Loading";
import { Module } from "~/components/structural/Module";
import { useFilterState } from "~/hooks";
import { useSkills } from "~/hooks/api";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { type SkillsChartFilterFormValues } from "./forms/SkillsChartFilterForm";
import { SkillsFilterDropdownMenu } from "./SkillsFilterDropdownMenu";

const SkillsBarChartView = dynamic(() => import("./charts/SkillsBarChartView"), {
  loading: () => <DynamicLoader />,
});

export const SkillsChartModule = () => {
  const { isLessThan } = useScreenSizes();

  const [filters, setFilters, resetFilters, filtersHaveChanged, differingFilters] =
    useFilterState<SkillsChartFilterFormValues>(
      {
        showTopSkills: "all",
        experiences: [],
        educations: [],
        categories: [],
        programmingDomains: [],
        programmingLanguages: [],
      },
      {
        experiences: arraysHaveSameElements,
        educations: arraysHaveSameElements,
        categories: arraysHaveSameElements,
        programmingDomains: arraysHaveSameElements,
        programmingLanguages: arraysHaveSameElements,
      },
    );

  const {
    data: skills,
    isLoading,
    error,
  } = useSkills({
    keepPreviousData: true,
    query: {
      ...filters,
      includes: [],
      visibility: "public",
      highlighted: true,
      order: "desc",
      orderBy: "calculatedExperience",
      limit: filters.showTopSkills === "all" ? undefined : filters.showTopSkills,
    },
  });

  return (
    <>
      <Module.Header
        className="!pr-[0px]"
        actions={[
          <SkillsFilterDropdownMenu
            filters={filters}
            skills={skills ?? []}
            key="0"
            filtersHaveChanged={filtersHaveChanged}
            onChange={f => setFilters(f)}
            isLoading={isLoading}
            onClear={() => resetFilters()}
          />,
          <Button.Solid
            key="1"
            scheme="secondary"
            className="py-[2px] px-[10px]"
            size={isLessThan("md") ? "xsmall" : "small"}
            isDisabled={!filtersHaveChanged}
            onClick={() => resetFilters()}
            icon={
              <CircleNumber size="20px" isActive={differingFilters.length !== 0}>
                {differingFilters.length}
              </CircleNumber>
            }
          >
            Clear
          </Button.Solid>,
        ]}
      >
        Skills Overview
      </Module.Header>
      <Module.Content className="xl:overflow-y-auto xl:pr-[16px]">
        <DynamicLoading>
          {({ isLoading: isLazyLoadingComponent }) => (
            <Loading isLoading={isLoading || isLazyLoadingComponent}>
              <Empty
                isEmpty={skills !== undefined && skills.length === 0}
                content={
                  differingFilters.length !== 0
                    ? "No skills match the search criteria."
                    : "No skills exist."
                }
              >
                {error ? (
                  <ErrorView error={error} />
                ) : skills !== undefined ? (
                  <SkillsBarChartView skills={skills ?? []} />
                ) : null}
              </Empty>
            </Loading>
          )}
        </DynamicLoading>
      </Module.Content>
    </>
  );
};
