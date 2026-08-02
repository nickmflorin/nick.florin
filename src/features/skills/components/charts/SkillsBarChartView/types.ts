import { type ApiSkill } from '~/database/model';

export type SkillsBarChartDatum = {
  readonly experience: number;
} & Pick<ApiSkill, 'id' | 'label' | 'slug'>;
