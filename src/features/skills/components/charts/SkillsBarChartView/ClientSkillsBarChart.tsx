'use client';
import dynamic from 'next/dynamic';
import { type CSSProperties, type JSX } from 'react';

import { type BarTooltipProps } from '@nivo/bar';

import { type ApiSkill } from '~/database/model';
import { generateChartColors } from '~/lib/charts';

import { BarChart } from '~/components/charts/BarChart';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { TooltipContent } from '~/components/floating/TooltipContent';
import { Loading } from '~/components/loading/Loading';
import { classNames } from '~/components/types';

import { type SkillsBarChartDatum } from './types';

const SkillsBarChartTooltip = dynamic(
  () => import('./SkillsBarChartTooltip').then(mod => mod.SkillsBarChartTooltip),
  {
    loading: () => <Loading isLoading spinnerSize='sm' />,
    ssr: false,
  },
);

interface ClientSkillsBarChartProps {
  readonly skills: ApiSkill[];
}

/**
 * A best estimate of the average tooltip size, used to keep the tooltip from rendering outside the
 * bounds of the chart.
 */
const TooltipWidth = 260;

const TooltipPaddingAdjustment = 10;

/**
 * Returns the horizontal position style for the skills bar chart tooltip.
 *
 * The tooltip is shifted left or right depending on where its bar sits within the chart, to
 * prevent the tooltip from being cut off by the edge of the chart or its overflow container.
 *
 * @param {number} barMidpoint The horizontal midpoint of the bar that the tooltip belongs to.
 * @param {number} elementWidth The width of the chart element that the tooltip renders inside.
 *
 * @returns {CSSProperties} The style used to reposition the tooltip, if repositioning is needed.
 */
const getTooltipPositionStyle = (barMidpoint: number, elementWidth: number): CSSProperties => {
  if (barMidpoint + TooltipWidth / 2 > elementWidth - TooltipPaddingAdjustment) {
    return { right: elementWidth - barMidpoint + TooltipPaddingAdjustment };
  } else if (barMidpoint - TooltipWidth / 2 < TooltipPaddingAdjustment) {
    return { left: barMidpoint + TooltipPaddingAdjustment };
  }
  return {};
};

export const ClientSkillsBarChart = ({ skills }: ClientSkillsBarChartProps): JSX.Element => {
  const { ids, open } = useDrawers();

  return (
    <BarChart<SkillsBarChartDatum>
      axisBottom={null}
      axisLeft={{
        legend: '# Years Experience',
        legendOffset: -40,
        legendPosition: 'middle',
        tickPadding: 5,
        tickRotation: 0,
        tickSize: 5,
        truncateTickAt: 0,
      }}
      barAriaLabel={d => `skill-${String(d.data.id)}`}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 1.6]],
      }}
      colorBy='indexValue'
      colors={generateChartColors(skills.length)}
      data={skills.map(skill => ({
        ...skill,
        experience: skill.calculatedExperience,
      }))}
      enableLabel={false}
      indexBy='label'
      keys={['experience']}
      onClick={datum => open(ids.VIEW_SKILL, { skillId: datum.data.id })}
      tooltip={props => {
        const barX = (props as { absX: number | undefined } & BarTooltipProps<SkillsBarChartDatum>)
          .absX;
        const barW = (props as { width: number | undefined } & BarTooltipProps<SkillsBarChartDatum>)
          .width;

        const element = document.getElementById('skills-bar-chart-element');

        const style: CSSProperties =
          barX !== undefined && element && barW !== undefined
            ? getTooltipPositionStyle(barX + barW / 2, element.clientWidth)
            : {};

        return (
          <TooltipContent
            className={classNames(
              'flex flex-col relative min-h-[40px] gap-[10px] px-[8px] py-[10px]',
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
