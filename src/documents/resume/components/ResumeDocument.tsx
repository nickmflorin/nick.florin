import { SHEETS } from '../data/pages';

import { Sheet } from './Sheet';

/**
 * The stacked browsing view of the resume: every sheet in one document. On screen the sheets are
 * separated with a backdrop so page boundaries are obvious; printed, they butt up exactly as the
 * per-sheet documents do.
 */
export const ResumeDocument = () => (
  <main className='stacked'>
    {SHEETS.map(sheet => (
      <Sheet key={sheet.id} sheet={sheet} />
    ))}
  </main>
);
