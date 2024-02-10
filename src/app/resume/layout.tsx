interface ResumeLayoutProps {
  readonly skills: React.ReactNode;
  readonly content: React.ReactNode;
  readonly children: React.ReactNode;
}

export default function ResumeLayout({ content, skills }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[40px]">
      <div className="flex flex-col max-w-[900px] p-[15px] grow">{skills}</div>
      <div className="grow min-w-[680px] max-w-[960px]">{content}</div>
    </div>
  );
}
