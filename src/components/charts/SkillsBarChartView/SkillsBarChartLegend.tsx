import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import type { ApiSkill } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { Legend } from "../Legend";

export interface SkillsBarChartLegendProps extends ComponentProps {
  readonly skills: ApiSkill[];
}

export const SkillsBarChartLegend = async ({
  skills,
  ...props
}: SkillsBarChartLegendProps): Promise<JSX.Element> => {
  if (skills.length === 0) {
    return <></>;
  }
  const colors = generateChartColors(skills.length);
  return (
    <div className={clsx("px-[10px] max-w-full")}>
      <Legend
        {...props}
        items={skills.map((skill, index) => ({
          label: skill.label,
          color: colors[index],
        }))}
      />
    </div>
  );
};

export default SkillsBarChartLegend;
