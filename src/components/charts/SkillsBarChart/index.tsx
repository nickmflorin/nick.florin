"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import { type ComponentProps } from "~/components/types";

import { BarChart } from "../BarChart";
import { Legend } from "../Legend";

const SkillsBarChartControl = dynamic(() => import("./SkillsBarChartControl"), {
  ssr: false,
});

export type SkillsBarChartDatum = { experience: number; skill: string };

export interface SkillsBarChartProps extends ComponentProps {
  readonly data: SkillsBarChartDatum[];
}

export const SkillsBarChart = ({ data, ...props }: SkillsBarChartProps): JSX.Element => {
  const params = useSearchParams();

  const filteredData = useMemo(() => {
    const topSkills = params.get("topSkills") || "8";
    if (topSkills === "all") {
      return data;
    } else if (topSkills && !isNaN(parseInt(topSkills))) {
      return data.slice(0, Number(topSkills));
    }
    return data.slice(0, 8);
  }, [data, params]);

  const colors = useMemo(() => generateChartColors(filteredData.length), [filteredData.length]);

  const legendItems = useMemo(
    () =>
      filteredData.map((datum, index) => ({
        label: datum.skill,
        color: colors[index],
      })),
    [colors, filteredData],
  );

  return (
    <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
      <SkillsBarChartControl className="pl-[50px] pr-[20px]" />
      <BarChart
        data={filteredData}
        indexBy="skill"
        keys={["experience"]}
        enableLabel={false}
        margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        colors={generateChartColors(filteredData.length)}
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
      />
      <Legend items={legendItems} className="pl-[50px] pr-[20px]" />
    </div>
  );
};

export default SkillsBarChart;
