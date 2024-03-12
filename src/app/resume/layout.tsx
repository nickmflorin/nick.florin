interface ResumeLayoutProps {
  readonly chart: React.ReactNode;
  readonly children: React.ReactNode;
}

export default function ResumeLayout({ children, chart }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[20px] min-h-full max-h-full">
      <div className="flex flex-col max-w-[900px] p-[15px] grow w-[50%] relative">{chart}</div>
      <div className="grow min-w-[680px] relative w-[50%] overflow-y-scroll">{children}</div>
    </div>
  );
}
