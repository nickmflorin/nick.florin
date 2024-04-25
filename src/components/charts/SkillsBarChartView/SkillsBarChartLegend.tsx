import { generateChartColors } from "~/lib/charts";
import { getSkills } from "~/actions/fetches/skills";
import { type SkillsFilters } from "~/api/schemas";
import { type ComponentProps } from "~/components/types";

import { Legend } from "../Legend";

export interface SkillsBarChartLegendProps extends ComponentProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

export const SkillsBarChartLegend = async ({
  filters,
  limit,
}: SkillsBarChartLegendProps): Promise<JSX.Element> => {
  const skills = await getSkills({
    includes: [],
    visibility: "public",
    filters: { ...filters, includeInTopSkills: true },
    limit,
  });
  if (skills.length === 0) {
    return <></>;
  }
  const colors = generateChartColors(skills.length);
  return (
    <Legend
      items={skills.map((skill, index) => ({
        label: skill.label,
        color: colors[index],
      }))}
      className="px-[20px]"
    />
  );
};

export default SkillsBarChartLegend;
