interface ResumeLayoutProps {
  readonly skills: React.ReactNode;
  readonly content: React.ReactNode;
  readonly children: React.ReactNode;
}

export default function ResumeLayout({ content, skills }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[20px] min-h-full max-h-full">
      <div className="flex flex-col max-w-[900px] p-[15px] grow w-[50%] relative">{skills}</div>
      <div className="grow min-w-[680px] relative w-[50%] overflow-y-scroll">{content}</div>
    </div>
  );
}
