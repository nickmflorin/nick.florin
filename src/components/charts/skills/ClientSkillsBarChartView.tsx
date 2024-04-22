"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { type SkillsChartFilterFormValues } from "~/components/forms/skills/SkillsChartFilterForm";
import { type ComponentProps } from "~/components/types";
import { useSkills } from "~/hooks";

import { BarChartSkeleton } from "../BarChartSkeleton";

import { SkillsBarChartContainer } from "./SkillsBarChartContainer";

const Chart = dynamic(() => import("./SkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
});

const SkillsFilterDropdownMenu = dynamic(
  () => import("~/components/menus/SkillsFilterDropdownMenu"),
);

export const ClientSkillsBarChartView = (props: ComponentProps): JSX.Element => {
  const [skillsQuery, setSkillsQuery] = useState<SkillsChartFilterFormValues>({
    showTopSkills: 12,
    educations: [],
    experiences: [],
    programmingDomains: [],
    programmingLanguages: [],
    categories: [],
  });

  const {
    data: skills,
    error,
    isInitialLoading,
    isLoading,
  } = useSkills({
    keepPreviousData: true,
    query: {
      filters: { ...skillsQuery, includeInTopSkills: true },
      includes: [],
      visibility: "public",
      limit: skillsQuery.showTopSkills === "all" ? undefined : skillsQuery.showTopSkills,
    },
  });

  return (
    <SkillsBarChartContainer {...props} skills={skills ?? []}>
      <SkillsFilterDropdownMenu
        buttonProps={{ isLocked: isLoading, className: "absolute z-50 right-[24px] top-[8px]" }}
        onChange={values => setSkillsQuery(values)}
      />
      <ApiResponseState
        isInitialLoading={isInitialLoading}
        isLoading={isLoading}
        error={error ? "There was an error rendering the chart." : null}
        skeleton={
          <BarChartSkeleton
            numBars={skillsQuery.showTopSkills === "all" ? 12 : skillsQuery.showTopSkills}
          />
        }
      >
        <div className="w-full h-full [&_g]:cursor-pointer">
          <Chart skills={skills ?? []} />
        </div>
      </ApiResponseState>
    </SkillsBarChartContainer>
  );
};

export default ClientSkillsBarChartView;
