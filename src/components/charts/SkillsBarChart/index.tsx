"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import clsx from "clsx";

import { SkillQuerySchema } from "~/app/api/types";
import { useSkills, useQueryParams } from "~/hooks";
import { generateChartColors } from "~/lib/charts";
import { parseQueryParams } from "~/lib/urls";
import { CircleIcon } from "~/components/icons/CircleIcon";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

import { BarChart } from "../BarChart";
import { Legend } from "../Legend";

const SkillsBarChartControl = dynamic(() => import("./SkillsBarChartControl"), {
  ssr: false,
});

export const SkillsBarChart = (props: ComponentProps): JSX.Element => {
  const { params, updateParams } = useQueryParams();

  const skillsQuery = useMemo(() => {
    const rawQuery = parseQueryParams(params, { keys: ["showTopSkills"] as const, form: "record" });
    const parsed = SkillQuerySchema.safeParse(rawQuery);
    if (parsed.success) {
      return parsed.data;
    }
    return { showTopSkills: 8 as const };
  }, [params]);

  // TODO: Handle loading & error states.
  const { data: _data, isLoading, error } = useSkills({ query: skillsQuery });

  const data = useMemo(
    () => (_data ?? []).map(skill => ({ skill: skill.label, experience: skill.experience })),
    [_data],
  );

  const colors = useMemo(() => generateChartColors(data.length), [data.length]);

  const legendItems = useMemo(
    () =>
      data.map((datum, index) => ({
        label: datum.skill,
        color: colors[index],
      })),
    [colors, data],
  );

  return (
    <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
      <SkillsBarChartControl
        className="px-[20px]"
        value={skillsQuery}
        onChange={query => {
          updateParams(query, { push: true, useTransition: false });
        }}
      />
      <BarChart
        data={data ?? []}
        skeletonVisible={isLoading}
        skeletonProps={{
          numBars: skillsQuery.showTopSkills === "all" ? 12 : skillsQuery.showTopSkills,
        }}
        indexBy="skill"
        keys={["experience"]}
        enableLabel={false}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        colors={colors}
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
        tooltip={props => (
          <div
            className={clsx(
              "flex flex-row gap-[4px] elevation-1",
              "bg-white border-gray-200 border rounded-xs p-1 items-center",
            )}
          >
            <div className="flex flex-row gap-[2px] items-center">
              <CircleIcon color={props.color} size={12} />
              <Label size="xs" className="leading-[14px]">
                {props.data.skill}
              </Label>
            </div>
            <Text
              size="xs"
              fontWeight="bold"
              className="leading-[14px]"
            >{`${props.data.experience} years`}</Text>
          </div>
        )}
      />
      <Legend items={legendItems} className="px-[20px]" />
    </div>
  );
};

export default SkillsBarChart;
