import { Sheets } from '../data/pages';

import { Sheet } from './Sheet';

/**
 * The stacked browsing view of the resume: every sheet in one document. On screen the sheets are
 * separated with a backdrop so page boundaries are obvious; printed, they butt up exactly as the
 * per-sheet documents do.
 *
 * This wrapper is the document's single `main` landmark, which is why the individual sheets do not
 * declare one of their own.
 */
export const ResumeDocument = () => (
  <main className='stacked'>
    {Sheets.map(sheet => (
      <Sheet key={sheet.id} sheet={sheet} />
    ))}
  </main>
);
