"use client";
import dynamic from "next/dynamic";

import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import { type ApiSkill } from "~/prisma/model";
import { BarChart } from "~/components/charts/BarChart";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { Loading } from "~/components/feedback/Loading";
import { TooltipContent } from "~/components/floating/TooltipContent";

import { type SkillsBarChartDatum } from "./types";

const SkillsBarChartTooltip = dynamic(() => import("./SkillsBarChartTooltip"), {
  ssr: false,
  loading: () => <Loading isLoading={true} spinnerSize="sm" />,
});

interface SkillsBarChartProps {
  readonly skills: ApiSkill[];
}

export const SkillsBarChart = ({ skills }: SkillsBarChartProps): JSX.Element => {
  const { open, ids } = useDrawers();
  return (
    <BarChart<SkillsBarChartDatum>
      data={skills.map(skill => ({
        ...skill,
        experience: skill.calculatedExperience,
      }))}
      indexBy="label"
      keys={["experience"]}
      enableLabel={false}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      colors={generateChartColors(skills.length)}
      colorBy="indexValue"
      axisBottom={null}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "# Years Experience",
        legendPosition: "middle",
        legendOffset: -40,
        truncateTickAt: 0,
      }}
      onClick={datum => open(ids.VIEW_SKILL, { skillId: datum.data.id })}
      tooltip={props => (
        <TooltipContent
          className={clsx("flex flex-col relative min-h-[40px] gap-[10px] px-[8px] py-[10px]")}
        >
          <SkillsBarChartTooltip {...props} />
        </TooltipContent>
      )}
    />
  );
};

export default SkillsBarChart;
