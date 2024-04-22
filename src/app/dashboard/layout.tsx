import type { ReactNode } from "react";

import { Module } from "~/components/modules/generic";

export interface DashboardPageProps {
  readonly experiences: ReactNode;
  readonly educations: ReactNode;
  readonly chart: ReactNode;
}

export default async function DashboardPage({
  experiences,
  educations,
  chart,
}: DashboardPageProps) {
  return (
    <div className="flex flex-row gap-[15px]">
      <div className="flex flex-col gap-[15px] w-[50%] max-w-[50%] min-w-[400px]">
        <Module title="Skills Overview">{chart}</Module>
      </div>
      <div className="flex flex-col gap-[15px] w-[50%] max-w-[400px] min-w-[300px]">
        <Module title="Recent Experiences" className="h-[338px]">
          {experiences}
        </Module>
        <Module title="Education">{educations}</Module>
      </div>
    </div>
  );
}
