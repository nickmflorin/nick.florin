import dynamic from "next/dynamic";

const SkillsBarChart = dynamic(() => import("./SkillsBarChart"), {
  ssr: true,
  loading: () => <div>Loading...</div>,
});

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

export default function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[40px]">
      <div className="flex flex-col min-w-[600px] w-[600px] max-w-[600px] p-[15px]">
        <SkillsBarChart className="w-full h-[400px]" />
      </div>
      <div className="grow">{children}</div>
    </div>
  );
}
