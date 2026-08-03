import { type Sheet as ResumeSheet } from '../data/types';

import { Sheet } from './Sheet';

export interface ResumeDocumentSheetProps {
  readonly sheet: ResumeSheet;
}

/**
 * A single standalone sheet of the resume, rendered with no stacked wrapper so the document
 * contains exactly one fixed-size page. This is the form the PDF pipeline prints: one sheet per
 * document guarantees each capture is exactly one PDF page.
 *
 * The `main` landmark is declared here, at the root of the document, rather than around the sheet's
 * main column, so that it appears exactly once however many sheets a document contains.
 */
export const ResumeDocumentSheet = ({ sheet }: ResumeDocumentSheetProps) => (
  <main>
    <Sheet sheet={sheet} />
  </main>
);
