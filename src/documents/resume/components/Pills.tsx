import { type Competency } from '../data/types';

export interface PillsProps {
  /**
   * The competencies to render as chips, in order.
   */
  readonly competencies: readonly Competency[];
  readonly where?: 'main' | 'sidebar';
}

/**
 * A wrapped row of competency chips. `where` selects the sidebar variant (`s-pill`, used for
 * competency groups) or the main-column variant (`m-pill`, used under a role).
 *
 * The two columns render different labels. The sidebar is a little over two hundred pixels wide, so
 * it takes the short label whenever a competency has one; the main column has room for the full
 * name. That is what lets two spellings of the same competency collapse into one record without
 * either surface losing the wording it needs.
 */
export const Pills = ({ competencies, where = 'main' }: PillsProps) => {
  const prefix = where === 'sidebar' ? 's' : 'm';
  return (
    <div className={`${prefix}-pills`}>
      {competencies.map(competency => (
        <span className={`${prefix}-pill`} key={competency.slug}>
          {where === 'sidebar' ? (competency.shortLabel ?? competency.label) : competency.label}
        </span>
      ))}
    </div>
  );
};
