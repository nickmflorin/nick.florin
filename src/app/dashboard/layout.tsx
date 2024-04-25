import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import clsx from "clsx";

import { EducationModule } from "~/components/modules/EducationModule";
import { ExperienceModule } from "~/components/modules/ExperienceModule";
import { Module } from "~/components/modules/generic";

const SkillsFilterDropdownMenu = dynamic(
  () => import("~/components/menus/SkillsFilterDropdownMenu"),
);

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
    <div className="h-full w-full max-h-full overflow-y-auto">
      <div className={clsx("flex flex-row gap-[15px]", "h-full max-h-full")}>
        <Module
          className="h-full min-w-[400px] grow"
          title="Skills Overview"
          overflow
          actions={[<SkillsFilterDropdownMenu key="0" placement="bottom-start" useSearchParams />]}
        >
          {chart}
        </Module>
        <ExperienceModule className="h-full max-w-[520px] min-w-[450px]" overflow>
          {experiences}
        </ExperienceModule>
        <div className="flex flex-col h-full gap-[15px] max-w-[520px] min-w-[450px]">
          <EducationModule overflow>{educations}</EducationModule>
          <Module title="Repositories" overflow>
            {repositories}
          </Module>
          <Module className="grow" title="Projects" overflow>
            {projects}
          </Module>
        </div>
      </div>
    </div>
  );
}
