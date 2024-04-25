import dynamic from "next/dynamic";

import { getSkills } from "~/actions/fetches/skills";
import { type SkillsFilters } from "~/api/schemas";
import { Loading } from "~/components/feedback/Loading";

const Chart = dynamic(() => import("../SkillsBarChart"), {
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
  return (
    <div className="w-full h-full [&_g]:cursor-pointer">
      <Chart skills={skills} />
    </div>
  );
};

export default SkillsBarChart;
