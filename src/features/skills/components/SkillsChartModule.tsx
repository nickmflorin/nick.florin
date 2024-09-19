"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { ErrorView } from "~/components/errors/ErrorView";
import { Tooltip } from "~/components/floating/Tooltip";
import { Loading } from "~/components/loading/Loading";
import { Module } from "~/components/structural/Module";
import { useSkills } from "~/hooks";

import { type SkillsChartFilterFormValues } from "./forms/SkillsChartFilterForm";
import { SkillsFilterDropdownMenu } from "./SkillsFilterDropdownMenu";

const SkillsBarChartView = dynamic(() => import("./charts/SkillsBarChartView"), {
  loading: () => <Loading isLoading={true} />,
});

export const SkillsChartModule = () => {
  const [filters, setFilters] = useState<SkillsChartFilterFormValues>({
    showTopSkills: "all",
    experiences: [],
    educations: [],
    categories: [],
    programmingDomains: [],
    programmingLanguages: [],
  });

  const {
    data: skills,
    isLoading,
    error,
  } = useSkills({
    query: {
      includes: [],
      visibility: "public",
      filters: { ...filters, includeInTopSkills: true },
      orderBy: [{ calculatedExperience: "desc" }],
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
            key="0"
            onChange={f => setFilters(f)}
            isLoading={isLoading}
          />,
        ]}
      >
        Skills Overview
      </Module.Header>
      <Module.Content className="xl:overflow-y-auto xl:pr-[16px]">
        <Loading isLoading={isLoading}>
          {error ? <ErrorView error={error} /> : <SkillsBarChartView skills={skills ?? []} />}
        </Loading>
      </Module.Content>
    </>
  );
};
