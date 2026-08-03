import { notFound } from 'next/navigation';

import { ResumeDocumentSheet } from '~/documents/resume/components/ResumeDocumentSheet';
import { SHEETS } from '~/documents/resume/data/pages';

interface ResumeDocumentSheetPageProps {
  readonly params: Promise<{ sheet: string }>;
}

export const generateStaticParams = () => SHEETS.map(sheet => ({ sheet: sheet.id }));

const ResumeDocumentSheetPage = async ({ params }: ResumeDocumentSheetPageProps) => {
  const { sheet: sheetId } = await params;
  const sheet = SHEETS.find(({ id }) => id === sheetId);
  if (sheet === undefined) {
    notFound();
  }
  return <ResumeDocumentSheet sheet={sheet} />;
};

export default ResumeDocumentSheetPage;
