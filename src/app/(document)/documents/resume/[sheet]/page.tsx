import { ResumeDocumentSheet } from '~/documents/resume/ResumeDocumentSheet';

interface ResumeDocumentSheetPageProps {
  readonly params: Promise<{ sheet: string }>;
}

const ResumeDocumentSheetPage = async ({ params }: ResumeDocumentSheetPageProps) => {
  const { sheet } = await params;
  return <ResumeDocumentSheet sheet={sheet} />;
};

export default ResumeDocumentSheetPage;
