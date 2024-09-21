"use client";
import dynamic from "next/dynamic";
import React from "react";

import { type BarTooltipProps } from "@nivo/bar";

import { type ApiSkill } from "~/database/model";
import { generateChartColors } from "~/lib/charts";

import { BarChart } from "~/components/charts/BarChart";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { TooltipContent } from "~/components/floating/TooltipContent";
import { Loading } from "~/components/loading/Loading";
import { classNames } from "~/components/types";

import { type SkillsBarChartDatum } from "./types";

const SkillsBarChartTooltip = dynamic(() => import("./SkillsBarChartTooltip"), {
  ssr: false,
  loading: () => <Loading isLoading={true} spinnerSize="sm" />,
});

interface ClientSkillsBarChartProps {
  readonly skills: ApiSkill[];
}

/* This is a best estimated guess for the average tooltip size.  It may need some fine
   tuning later on, but seems to work for now. */
const TooltipWidth = 260;

const TooltipPaddingAdjustment = 10;

export const ClientSkillsBarChart = ({ skills }: ClientSkillsBarChartProps): JSX.Element => {
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
      barAriaLabel={d => `skill-${String(d.data.id)}`}
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
      tooltip={props => {
        /* We want to apply left and right adjustments to the tooltip depending on the coordinates
           of the bar to prevent the tooltip from going off screen (or getting cutoff by the
           overflow). */
        const barX = (props as BarTooltipProps<SkillsBarChartDatum> & { absX: number | undefined })
          .absX;
        const barW = (props as BarTooltipProps<SkillsBarChartDatum> & { width: number | undefined })
          .width;

        const element = document.getElementById("skills-bar-chart-element");

        let style: React.CSSProperties = {};
        if (barX !== undefined && element && barW !== undefined) {
          const barMidpoint = barX + barW / 2;

          if (barMidpoint + TooltipWidth / 2 > element.clientWidth - TooltipPaddingAdjustment) {
            style = {
              ...style,
              right: element.clientWidth - barMidpoint + TooltipPaddingAdjustment,
            };
          } else if (barMidpoint - TooltipWidth / 2 < TooltipPaddingAdjustment) {
            style = { ...style, left: barMidpoint + TooltipPaddingAdjustment };
          }
        }

        return (
          <TooltipContent
            className={classNames(
              "flex flex-col relative min-h-[40px] gap-[10px] px-[8px] py-[10px]",
            )}
            style={style}
          >
            <SkillsBarChartTooltip {...props} />
          </TooltipContent>
        );
      }}
    />
  );
};
