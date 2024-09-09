import dynamic from "next/dynamic";
import { memo } from "react";

import clsx from "clsx";

import { getSkills } from "~/actions/fetches/skills";
import type { SkillsFilters } from "~/api/schemas";

import { Loading } from "~/components/feedback/Loading";

import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

export interface SkillsBarChartViewContentProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

const Chart = dynamic(() => import("./ClientSkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
});

export const SkillsBarChartViewContent = memo(
  async ({ filters, limit }: SkillsBarChartViewContentProps): Promise<JSX.Element> => {
    const skills = await getSkills({
      includes: [],
      visibility: "public",
      filters: { ...filters, includeInTopSkills: true },
      limit,
    });
    return (
      <>
        <div
          className={clsx("relative", "max-md:h-[340px]", "md:max-lg:h-[500px]", "lg:h-[600px]")}
        >
          <Chart skills={skills} />
        </div>
        <SkillsBarChartLegend skills={skills} />
      </>
    );
  },
);

export default SkillsBarChartViewContent;
