import dynamic from "next/dynamic";

import { getSkills } from "~/actions/fetches/skills";
import { type SkillsFilters } from "~/api/schemas";
import { Loading } from "~/components/feedback/Loading";

const Chart = dynamic(() => import("./ClientSkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
});

export interface SkillsBarChartProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

export const SkillsBarChart = async ({
  filters,
  limit,
}: SkillsBarChartProps): Promise<JSX.Element> => {
  const skills = await getSkills({
    includes: [],
    visibility: "public",
    filters: { ...filters, includeInTopSkills: true },
    limit,
  });
  return <Chart skills={skills} />;
};

export default SkillsBarChart;
