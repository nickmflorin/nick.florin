import type { ReactNode } from "react";

import clsx from "clsx";

import { Link } from "~/components/buttons";
import { Module } from "~/components/modules/generic";

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
      <Module>{chart}</Module>
      <div className={clsx("flex gap-[15px]", "md:flex-row", "xl:h-full", "max-md:flex-col")}>
        <Module
          className={clsx(
            "xl:max-w-[520px] xl:min-w-[400px]",
            "max-xl:w-[50%] max-xl:max-w-[50%]",
            "max-md:w-full max-md:max-w-full",
          )}
        >
          <Module.Header
            actions={[
              <Link.Primary
                key="0"
                options={{ as: "link" }}
                href="/resume/experience"
                fontSize="xs"
                fontWeight="medium"
              >
                View All
              </Link.Primary>,
            ]}
          >
            Recent Experiences
          </Module.Header>
          <Module.Content className="flex flex-col gap-[12px] xl:overflow-y-auto xl:pr-[16px]">
            {experiences}
          </Module.Content>
        </Module>
        <div
          className={clsx(
            "flex flex-col gap-[15px]",
            "xl:max-w-[520px] xl:min-w-[400px]",
            "max-xl:w-[50%] max-xl:max-w-[50%]",
            "max-md:w-full max-md:max-w-full",
          )}
        >
          <Module className="xl:overflow-y-hidden">
            <Module.Header
              actions={[
                <Link.Primary
                  key="0"
                  options={{ as: "link" }}
                  href="/resume/education"
                  fontSize="xs"
                  fontWeight="medium"
                >
                  View All
                </Link.Primary>,
              ]}
            >
              Education
            </Module.Header>
            <Module.Content
              className={clsx(
                "flex flex-col gap-[12px]",
                "xl:overflow-y-auto xl:grow xl:pr-[16px]",
              )}
            >
              {educations}
            </Module.Content>
          </Module>
          <Module className="xl:overflow-y-hidden">
            <Module.Header>Repositories</Module.Header>
            <Module.Content className={clsx("xl:overflow-y-auto xl:grow xl:pr-[16px]")}>
              {repositories}
            </Module.Content>
          </Module>
          <Module>
            <Module.Header>Projects</Module.Header>
            <Module.Content className={clsx("flex flex-col gap-[12px]")}>{projects}</Module.Content>
          </Module>
        </div>
      </div>
    </div>
  );
}
