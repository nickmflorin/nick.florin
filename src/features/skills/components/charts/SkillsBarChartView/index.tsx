'use client';
import { type JSX } from 'react';

import { type ApiSkill } from '~/database/model';

import { classNames, type ComponentProps } from '~/components/types';
import { useIsHydrated } from '~/hooks/use-is-hydrated';

import { SkillsBarChartHeightClassNames } from '../constants';
import { SkillsBarChartSkeleton } from '../SkillsBarChartSkeleton';

import { ClientSkillsBarChart } from './ClientSkillsBarChart';
import { SkillsBarChartLegend } from './SkillsBarChartLegend';

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly skills: ApiSkill<[]>[];
}

/**
 * Renders the skills bar chart and its legend together, or the chart skeleton until the client
 * has hydrated.
 *
 * The chart itself (Nivo) can only draw after hydration, when it can measure its container — but
 * the legend is plain DOM that would otherwise render immediately, including on the server.
 * Gating both on the same hydration state ensures the legend never appears without the chart:
 * every pre-ready state shows the identical {@link SkillsBarChartSkeleton}, and the chart and
 * legend then appear in the same commit.
 */
export const SkillsBarChartView = ({ skills, ...props }: SkillsBarChartViewProps): JSX.Element => {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return <SkillsBarChartSkeleton />;
  }
  return (
    <div
      {...props}
      className={classNames(
        'skills-bar-chart-view flex flex-col gap-[8px] h-full w-full max-h-full max-w-full',
        '[&_g]:cursor-pointer',
        props.className,
      )}
    >
      <div
        className={classNames('relative', SkillsBarChartHeightClassNames)}
        id='skills-bar-chart-element'
      >
        <ClientSkillsBarChart skills={skills} />
      </div>
      <SkillsBarChartLegend skills={skills} />
    </div>
  );
};
