import type { ReactNode } from "react";

import { Link } from "~/components/buttons";
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
      <div className="flex flex-1 flex-col gap-[15px] w-[50%] max-w-[50%] min-w-[400px]">
        <Module title="Skills Overview">{chart}</Module>
      </div>
      <div className="flex flex-row flex-1 gap-[15px]">
        <div className="flex flex-col flex-1 gap-[15px] w-[50%] max-w-[50%] min-w-[300px]">
          <Module
            title="Recent Experiences"
            className="h-[588px]"
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
            {experiences}
          </Module>
        </div>
        <div className="flex flex-col flex-1 gap-[15px] w-[50%] max-w-[50%] min-w-[300px]">
          {" "}
          <Module
            title="Education"
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
            {educations}
          </Module>
        </div>
      </div>
    </div>
  );
}
