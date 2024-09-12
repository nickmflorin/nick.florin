import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { LinkComponent } from "~/components/buttons";
import { Module } from "~/components/modules/generic";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

const Tour = dynamic(() => import("~/components/tours/Tour"));

const Link = dynamic(() =>
  import("~/components/buttons/generic/Link").then(mod => mod.Link),
) as LinkComponent;

interface ColumnProps extends ComponentProps {
  readonly children: ReactNode;
}

const Column = ({ children, ...props }: ColumnProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "flex flex-col gap-[15px] lg:min-w-[320px]",
      "max-xl:w-[50%] max-xl:max-w-[50%]",
      "max-md:w-full max-md:max-w-full",
      props.className,
    )}
  >
    {children}
  </div>
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
    <>
      <Tour />
      <div className={classNames("max-h-full", "overflow-y-auto pr-[16px]")}>
        <div className={classNames("flex gap-[15px]", "xl:flex-row", "max-xl:flex-col")}>
          {/* The 655px comes from 2(320px for each column) + 15px for gap = 655px. */}
          <Module
            className={classNames(
              "md:max-lg:min-w-[655px] xl:max-w-[1000px] lg:min-w-[320px] min-h-[200px]",
            )}
          >
            {chart}
          </Module>
          <div className={classNames("flex gap-[15px]", "md:flex-row md:grow", "max-md:flex-col")}>
            <Column className="md:flex-1">
              <Module
                className="xl:overflow-y-hidden grow min-h-[200px]"
                data-attr-tour-id="recent-experience"
              >
                <Module.Header
                  actions={[
                    <Link
                      key="0"
                      element="link"
                      href="/resume/experience"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      View All
                    </Link>,
                  ]}
                >
                  Recent Experiences
                </Module.Header>
                <Module.Content
                  className={classNames(
                    "flex flex-col gap-[12px]",
                    "xl:overflow-y-auto xl:pr-[16px]",
                  )}
                >
                  {experiences}
                </Module.Content>
              </Module>
              <Module className="min-h-[200px]">
                <Module.Header>Projects</Module.Header>
                <Module.Content
                  className={classNames(
                    "flex flex-col gap-[12px] xl:overflow-y-auto xl:grow xl:pr-[16px]",
                  )}
                >
                  {projects}
                </Module.Content>
              </Module>
            </Column>
            <Column className="md:flex-1">
              <Module className="xl:overflow-y-hidden min-h-[200px]">
                <Module.Header
                  actions={[
                    <Link
                      key="0"
                      element="link"
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
                  className={classNames(
                    "flex flex-col gap-[12px]",
                    "xl:overflow-y-auto xl:grow xl:pr-[16px]",
                  )}
                >
                  {educations}
                </Module.Content>
              </Module>
              <Module className="xl:overflow-y-hidden grow min-h-[200px]">
                <Module.Header>Repositories</Module.Header>
                <Module.Content className={classNames("xl:overflow-y-auto xl:grow xl:pr-[16px]")}>
                  {repositories}
                </Module.Content>
              </Module>
            </Column>
          </div>
        </div>
      </div>
    </>
  );
}
