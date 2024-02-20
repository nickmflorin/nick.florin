import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart/index"), {
  loading: () => <Loading loading={true} />,
});

export default function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <div className="flex flex-row gap-[20px] min-h-full max-h-full">
      <div className="flex flex-col max-w-[900px] p-[15px] grow w-[50%] relative">
        <SkillsBarChart className="w-full h-[400px]" />
      </div>
      <div className="grow min-w-[680px] relative w-[50%] overflow-y-scroll">{children}</div>
    </div>
  );
}
