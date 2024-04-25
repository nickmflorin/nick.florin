import type { ReactNode } from "react";

import clsx from "clsx";

import { EducationModule } from "~/components/modules/EducationModule";
import { ExperienceModule } from "~/components/modules/ExperienceModule";
import { Module } from "~/components/modules/generic";
import { type ComponentProps } from "~/components/types";

export interface DashboardPageProps {
  readonly experiences: ReactNode;
  readonly educations: ReactNode;
  readonly repositories: ReactNode;
  readonly projects: ReactNode;
  readonly chart: ReactNode;
}

export default async function DashboardPage({
  experiences,
  educations,
  repositories,
  chart,
  projects,
}: DashboardPageProps) {
  return (
    <div
      className={clsx(
        "grid grid-flow-col grid-rows-3 grid-cols-3",
        "gap-[15px] max-h-full overflow-y-auto auto-rows-max",
      )}
    >
      <Module className="row-span-3" title="Skills Overview" overflow>
        {chart}
      </Module>
      <ExperienceModule className="row-span-3 flex flex-col gap-[15px]" overflow>
        {experiences}
      </ExperienceModule>
      <div className="grid grid-cols-subgrid row-span-3 gap-[15px]">
        <EducationModule className="flex-none shrink-0 h-fit">{educations}</EducationModule>
        <Module className="max-h-fit flex-none shrink-0 h-fit" title="Repositories">
          {repositories}
        </Module>
        <Module className="max-h-fit flex-none shrink-0 h-fit" title="Projects">
          {projects}
        </Module>
      </div>
    </div>
  );
}
