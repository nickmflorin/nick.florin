import { notFound } from 'next/navigation';

import { ResumeDocumentSheet } from '~/documents/resume/components/ResumeDocumentSheet';
import { Sheets } from '~/documents/resume/data/pages';

interface ResumeDocumentSheetPageProps {
  readonly params: Promise<{ sheet: string }>;
}

export const generateStaticParams = () => Sheets.map(sheet => ({ sheet: sheet.id }));

const ResumeDocumentSheetPage = async ({ params }: ResumeDocumentSheetPageProps) => {
  const { sheet: sheetId } = await params;
  const sheet = Sheets.find(({ id }) => id === sheetId);
  if (sheet === undefined) {
    notFound();
  }
  return <ResumeDocumentSheet sheet={sheet} />;
};

export default ResumeDocumentSheetPage;
