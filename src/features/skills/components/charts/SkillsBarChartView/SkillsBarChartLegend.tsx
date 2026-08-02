import { type JSX } from 'react';

import { type ApiSkill } from '~/database/model';
import { generateChartColors } from '~/lib/charts';

import { Legend } from '~/components/charts/Legend';
import { classNames, type ComponentProps } from '~/components/types';

export interface SkillsBarChartLegendProps extends ComponentProps {
  readonly skills: ApiSkill[];
}

export const SkillsBarChartLegend = ({
  skills,
  ...props
}: SkillsBarChartLegendProps): JSX.Element | null => {
  if (skills.length === 0) {
    return null;
  }
  const colors = generateChartColors(skills.length);
  return (
    <div className={classNames('px-[10px] max-w-full')}>
      <Legend
        {...props}
        items={skills.map((skill, index) => ({
          color: colors[index],
          label: skill.label,
        }))}
      />
    </div>
  );
};
