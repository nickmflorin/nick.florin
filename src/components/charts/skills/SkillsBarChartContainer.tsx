import { type ReactNode, useMemo } from "react";

import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import type { BrandSkill } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { ChartContainer } from "../ChartContainer";
import { Legend } from "../Legend";

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly skills: BrandSkill[];
  readonly children: ReactNode;
}

export const SkillsBarChartContainer = ({
  children,
  skills,
  ...props
}: SkillsBarChartViewProps): JSX.Element => {
  const colors = useMemo(() => generateChartColors(skills.length), [skills.length]);
  return (
    <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
      <ChartContainer className="grow">{children}</ChartContainer>
      <Legend
        items={skills.map((skill, index) => ({
          label: skill.label,
          color: colors[index],
        }))}
        className="px-[20px]"
      />
    </div>
  );
};

export default SkillsBarChartContainer;
