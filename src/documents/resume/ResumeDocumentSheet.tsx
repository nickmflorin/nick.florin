export interface ResumeDocumentSheetProps {
  readonly sheet: string;
}

export const ResumeDocumentSheet = ({ sheet }: ResumeDocumentSheetProps) => (
  <main>
    <div className='page'>
      <p>{`Content for sheet '${sheet}' renders here once the renderer components are ported.`}</p>
    </div>
  </main>
);
