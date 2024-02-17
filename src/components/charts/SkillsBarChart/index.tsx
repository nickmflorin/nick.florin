"use client";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";

import clsx from "clsx";
import { type z } from "zod";

import type * as types from "../types";

import { SkillQuerySchema } from "~/app/api/types";
import { useSkills, useQueryParams } from "~/hooks";
import { generateChartColors } from "~/lib/charts";
import { parseQueryParams } from "~/lib/urls";
import { Form } from "~/components/forms/Form";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { BarChartSkeleton } from "../BarChartSkeleton";
import { ChartContainer } from "../ChartContainer";
import { Legend } from "../Legend";

import { SkillsBarChartForm } from "./SkillsBarChartForm";
import { SkillBarChartFormSchema } from "./types";

const BarChart = dynamic(() => import("../BarChart"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
}) as types.BarChart;

const Tooltip = dynamic(
  () => import("./SkillsBarChartTooltip").then(mod => mod.SkillsBarChartTooltip),
  {
    loading: () => <Loading loading={true} />,
  },
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
    () =>
      (_data ?? []).map(skill => ({
        skill: skill.label,
        experience: skill.experience ?? skill.autoExperience,
      })),
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
      <SkillsBarChartForm className="px-[20px]" form={{ ...form, setValues }} />
      <ChartContainer
        error={error ? "There was an error rendering the chart." : null}
        isLoading={isLoading}
        isInitialLoading={isInitialLoading}
        skeleton={
          <BarChartSkeleton
            numBars={skillsQuery.showTopSkills === "all" ? 12 : skillsQuery.showTopSkills}
          />
        }
      >
        <BarChart
          data={data ?? []}
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
          tooltip={props => <Tooltip {...props} />}
        />
        <Legend items={legendItems} className="px-[20px]" />
      </ChartContainer>
    </div>
  );
};

export default SkillsBarChart;
