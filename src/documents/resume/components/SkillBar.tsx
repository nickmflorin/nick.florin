import { type Proficiency } from '../data/types';

/**
 * The badge text for each proficiency tier. The tier also drives the fill width, which lives in
 * the document styles as `.fill-<level>`.
 */
const ProficiencyLabels: Record<Proficiency, string> = {
  advanced: 'Advanced',
  expert: 'Expert',
  familiar: 'Familiar',
  proficient: 'Proficient',
};

export interface SkillBarProps {
  readonly level: Proficiency;
  readonly name: string;
}

export const SkillBar = ({ level, name }: SkillBarProps) => (
  <div className='skill-row'>
    <span className='skill-name'>{name}</span>
    <div className='skill-track'>
      <div className={`skill-fill fill-${level}`} />
    </div>
    <span className='skill-badge'>{ProficiencyLabels[level]}</span>
  </div>
);
