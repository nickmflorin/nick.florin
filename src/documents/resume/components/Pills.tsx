export interface PillsProps {
  /**
   * The label of each chip, in render order. The type is a readonly array because a role's chips
   * arrive as the `skills` of a resolved content owner.
   */
  readonly pills: readonly string[];
  readonly where?: 'main' | 'sidebar';
}

/**
 * A wrapped row of technology chips. `where` selects the sidebar variant (`s-pill`, used for
 * skill groups) or the main-column variant (`m-pill`, used under a role).
 */
export const Pills = ({ pills, where = 'main' }: PillsProps) => {
  const prefix = where === 'sidebar' ? 's' : 'm';
  return (
    <div className={`${prefix}-pills`}>
      {pills.map(pill => (
        <span className={`${prefix}-pill`} key={pill}>
          {pill}
        </span>
      ))}
    </div>
  );
};
