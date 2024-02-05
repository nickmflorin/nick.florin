interface ResumeLayoutProps {
  readonly skills: React.ReactNode;
  readonly content: React.ReactNode;
  readonly children: React.ReactNode;
}

export default function ResumeLayout({ content, skills }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[40px]">
      <div className="flex flex-col min-w-[600px] w-[600px] max-w-[600px] p-[15px]">{skills}</div>
      <div className="grow">{content}</div>
    </div>
  );
}
