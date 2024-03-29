"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import clsx from "clsx";
import pick from "lodash.pick";

import { generateChartColors } from "~/lib/charts";
import { ChartFilterButton } from "~/components/buttons/ChartFilterButton";
import { Floating } from "~/components/floating/Floating";
import { useForm } from "~/components/forms/generic/hooks/use-form";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/components/forms/skills/SkillsChartFilterForm";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";
import { useSkills } from "~/hooks";

import { BarChartSkeleton } from "../BarChartSkeleton";
import { ChartContainer } from "../ChartContainer";
import { Legend } from "../Legend";

import { type SkillsBarChartDatum } from "./types";

const Chart = dynamic(() => import("./SkillsBarChart"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export const SkillsBarChart = (props: ComponentProps): JSX.Element => {
  const [skillsQuery, setSkillsQuery] = useState<SkillsChartFilterFormValues>({
    showTopSkills: 12,
    educations: [],
    experiences: [],
    programmingDomains: [],
    programmingLanguages: [],
    categories: [],
  });

  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: 12 },
    onChange: ({ values }) => {
      setSkillsQuery(values);
    },
  });

  const {
    data: _data,
    error,
    isInitialLoading,
    isLoading,
  } = useSkills({
    query: skillsQuery,
  });

  const data = useMemo<SkillsBarChartDatum[]>(
    () =>
      (_data ?? []).map(skill => ({
        ...pick(skill, ["id", "label", "slug", "experiences", "educations"]),
        experience: skill.experience ?? skill.autoExperience,
      })),
    [_data],
  );

  const colors = useMemo(() => generateChartColors(data.length), [data.length]);

  const legendItems = useMemo(
    () =>
      data.map((datum, index) => ({
        label: datum.label,
        color: colors[index],
      })),
    [colors, data],
  );

  return (
    <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
      <ChartContainer
        className="grow"
        error={error ? "There was an error rendering the chart." : null}
        isLoading={isLoading}
        isInitialLoading={isInitialLoading}
        skeleton={
          <BarChartSkeleton
            numBars={skillsQuery.showTopSkills === "all" ? 12 : skillsQuery.showTopSkills}
          />
        }
      >
        <Floating
          placement="bottom-end"
          triggers={["click"]}
          offset={{ mainAxis: 4 }}
          withArrow={false}
          width={400}
          className="p-[20px] rounded-md overflow-y-scroll"
          variant="white"
          content={<SkillsChartFilterForm form={{ ...form, setValues }} />}
        >
          {({ ref, params }) => (
            <ChartFilterButton
              {...params}
              className="absolute z-50 right-[24px] top-[8px]"
              ref={ref}
              isDisabled={error !== undefined}
              isLocked={isLoading}
            />
          )}
        </Floating>
        <Chart data={data ?? []} />
      </ChartContainer>
      <Legend items={legendItems} className="px-[20px]" />
    </div>
  );
};

export default SkillsBarChart;
