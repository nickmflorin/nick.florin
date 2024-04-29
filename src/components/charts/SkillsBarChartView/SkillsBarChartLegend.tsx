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
    <div
      className={clsx(
        "xl:px-[10px] xl:max-w-full",
        "max-md:px-[10px] max-md:max-w-full",
        "md:max-xl:max-h-full md:max-xl:overflow-y-auto md:max-xl:max-w-[390px]",
      )}
    >
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
