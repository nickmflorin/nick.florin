import { type Sheet as ResumeSheet } from '../data/types';

import { Sheet } from './Sheet';

export interface ResumeDocumentSheetProps {
  readonly sheet: ResumeSheet;
}

/**
 * A single standalone sheet of the resume, rendered with no stacked wrapper so the document
 * contains exactly one fixed-size page. This is the form the PDF pipeline prints: one sheet per
 * document guarantees each capture is exactly one PDF page.
 */
export const ResumeDocumentSheet = ({ sheet }: ResumeDocumentSheetProps) => <Sheet sheet={sheet} />;
