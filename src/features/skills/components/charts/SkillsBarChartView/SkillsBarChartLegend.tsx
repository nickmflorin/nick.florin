import type { ApiSkill } from "~/database/model";
import { generateChartColors } from "~/lib/charts";

import { Legend } from "~/components/charts/Legend";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface SkillsBarChartLegendProps extends ComponentProps {
  readonly skills: ApiSkill[];
}

export const SkillsBarChartLegend = ({
  skills,
  ...props
}: SkillsBarChartLegendProps): JSX.Element => {
  if (skills.length === 0) {
    return <></>;
  }
  const colors = generateChartColors(skills.length);
  return (
    <div className={classNames("px-[10px] max-w-full")}>
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
