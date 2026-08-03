export interface ResumeDocumentSheetProps {
  readonly sheet: string;
}

export const ResumeDocumentSheet = ({ sheet }: ResumeDocumentSheetProps) => (
  <main>
    <h1>Resume Document Sheet</h1>
    <p>{`The standalone printable sheet '${sheet}' of the generated resume will render here.`}</p>
  </main>
);
