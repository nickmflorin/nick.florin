import { type JSX } from 'react';

import { type ApiSkill } from '~/database/model';

import { classNames, type ComponentProps } from '~/components/types';

import { ClientSkillsBarChart } from './ClientSkillsBarChart';
import { SkillsBarChartLegend } from './SkillsBarChartLegend';

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly skills: ApiSkill<[]>[];
}

export const SkillsBarChartView = ({ skills, ...props }: SkillsBarChartViewProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      'skills-bar-chart-view flex flex-col gap-[8px] h-full w-full max-h-full max-w-full',
      '[&_g]:cursor-pointer',
      props.className,
    )}
  >
    <div
      className={classNames('relative', 'max-md:h-[340px]', 'md:max-lg:h-[500px]', 'lg:h-[600px]')}
      id='skills-bar-chart-element'
    >
      <ClientSkillsBarChart skills={skills} />
    </div>
    <SkillsBarChartLegend skills={skills} />
  </div>
);
