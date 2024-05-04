import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import clsx from "clsx";

import type { LinkComponent } from "~/components/buttons";
import { Module } from "~/components/modules/generic";

const Link = dynamic(() =>
  import("~/components/buttons/generic/Link").then(mod => mod.Link),
) as LinkComponent;

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
    <div className={clsx("max-h-full", "overflow-y-auto pr-[12px]")}>
      <div className={clsx("flex gap-[15px]", "xl:flex-row", "max-xl:flex-col")}>
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
                <Link
                  key="0"
                  as="link"
                  href="/resume/experience"
                  fontSize="xs"
                  flex
                  fontWeight="medium"
                >
                  View All
                </Link>,
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
                  <Link
                    key="0"
                    flex
                    as="link"
                    href="/resume/education"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    View All
                  </Link>,
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
              <Module.Content
                className={clsx("flex flex-col gap-[12px] xl:overflow-y-auto xl:grow xl:pr-[16px]")}
              >
                {projects}
              </Module.Content>
            </Module>
          </div>
        </div>
      </div>
    </div>
  );
}
