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
    <div
      className={clsx(
        "flex gap-[15px]",
        "xl:flex-row",
        "max-xl:flex-col max-xl:h-full max-xl:max-h-full",
        "max-xl:overflow-y-auto max-xl:pr-[12px]",
        "xl:h-full xl:max-h-full",
      )}
    >
      <Module
        contentClassName="xl:overflow-y-auto xl:pr-[16px]"
        title="Skills Overview"
        actions={[<SkillsFilterDropdownMenu key="0" placement="bottom-start" useSearchParams />]}
      >
        {chart}
      </Module>
      <div className={clsx("flex gap-[15px]", "md:flex-row", "xl:h-full", "max-md:flex-col")}>
        <ExperienceModule
          className={clsx(
            "xl:max-w-[520px] xl:min-w-[400px]",
            "max-xl:w-[50%] max-xl:max-w-[50%]",
            "max-md:w-full max-md:max-w-full",
          )}
          contentClassName={clsx("xl:overflow-y-auto xl:pr-[16px]")}
        >
          {experiences}
        </ExperienceModule>
        <div
          className={clsx(
            "flex flex-col gap-[15px]",
            "xl:max-w-[520px] xl:min-w-[400px]",
            "max-xl:w-[50%] max-xl:max-w-[50%]",
            "max-md:w-full max-md:max-w-full",
          )}
        >
          <EducationModule
            className="xl:overflow-y-hidden"
            contentClassName="xl:overflow-y-auto xl:grow xl:pr-[16px]"
          >
            {educations}
          </EducationModule>
          <Module
            title="Repositories"
            className="xl:overflow-y-hidden"
            contentClassName="xl:overflow-y-auto xl:grow xl:pr-[16px]"
          >
            {repositories}
          </Module>
          <Module title="Projects">{projects}</Module>
        </div>
      </div>
    </div>
    // </div>
  );
}
