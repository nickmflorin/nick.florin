import { type Competency, Proficiency } from '../data/types';

/**
 * The badge text for each proficiency tier. The tier also drives the fill width, which lives in
 * the document styles as `.fill-<tier>`, keyed off the lowercased enum value.
 */
const ProficiencyLabels: Record<Proficiency, string> = {
  [Proficiency.Advanced]: 'Advanced',
  [Proficiency.Expert]: 'Expert',
  [Proficiency.Familiar]: 'Familiar',
  [Proficiency.Proficient]: 'Proficient',
};

export interface CompetencyBarProps {
  readonly competency: Competency;
}

/**
 * One competency rendered as a proficiency bar.
 *
 * Renders nothing when the competency has never been rated. A group configured to display bars is
 * expected to hold only rated competencies, so this is a guard against a data mistake rather than
 * an expected branch.
 */
export const CompetencyBar = ({ competency }: CompetencyBarProps) => {
  if (competency.proficiency === null) {
    return null;
  }
  const tier = competency.proficiency.toLowerCase();
  return (
    <div className='skill-row'>
      <span className='skill-name'>{competency.shortLabel ?? competency.label}</span>
      <div className='skill-track'>
        <div className={`skill-fill fill-${tier}`} />
      </div>
      <span className='skill-badge'>{ProficiencyLabels[competency.proficiency]}</span>
    </div>
  );
};
