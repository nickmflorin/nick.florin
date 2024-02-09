"use client";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";

import clsx from "clsx";
import { type z } from "zod";

import { SkillQuerySchema } from "~/app/api/types";
import { useSkills, useQueryParams } from "~/hooks";
import { generateChartColors } from "~/lib/charts";
import { parseQueryParams } from "~/lib/urls";
import { FloatingContent } from "~/components/floating/FloatingContent";
import { Form } from "~/components/forms/Form";
import { CircleIcon } from "~/components/icons/CircleIcon";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

import { BarChart } from "../BarChart";
import { Legend } from "../Legend";

import { SkillBarChartFormSchema } from "./types";

const SkillBarChartForm = dynamic(() => import("./SkillBarChartForm"), {
  ssr: false,
});

const SkillsBarChartTooltip = (props: {
  color: string;
  data: { experience: number; skill: string };
}) => (
  <FloatingContent variant="secondary" className="flex flex-row gap-[4px] items-center">
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
  </FloatingContent>
);

export const SkillsBarChart = (props: ComponentProps): JSX.Element => {
  const { params, updateParams } = useQueryParams();

  const skillsQuery = useMemo(() => {
    const rawQuery = parseQueryParams(params, { keys: ["showTopSkills"] as const, form: "record" });
    const parsed = SkillQuerySchema.safeParse(rawQuery);
    if (parsed.success) {
      return parsed.data;
    }
    return { showTopSkills: 12 as const };
  }, [params]);

  const { setValues, ...form } = Form.useForm<z.infer<typeof SkillBarChartFormSchema>>({
    schema: SkillBarChartFormSchema,
    defaultValues: { showTopSkills: 12 },
    onChange: ({ values }) => {
      updateParams(values, { push: true, useTransition: false });
    },
  });

  useEffect(() => {
    setValues(skillsQuery);
  }, [skillsQuery, setValues]);

  // TODO: Handle loading & error states.
  const { data: _data, error, isInitialLoading, isLoading } = useSkills({ query: skillsQuery });

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
      <SkillBarChartForm className="px-[20px]" form={{ ...form, setValues }} />
      <BarChart
        error={error ? "There was an error rendering the chart." : null}
        data={data ?? []}
        isLoading={isLoading}
        isInitialLoading={isInitialLoading}
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
        tooltip={props => <SkillsBarChartTooltip {...props} />}
      />
      <Legend items={legendItems} className="px-[20px]" />
    </div>
  );
};

export default SkillsBarChart;
