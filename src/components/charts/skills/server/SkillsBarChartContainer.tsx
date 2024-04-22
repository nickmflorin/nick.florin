import { type ReactNode, Suspense } from "react";

import clsx from "clsx";

import type { SkillsFilters } from "~/api/schemas";
import { SkillsBarChartLegend } from "~/components/charts/skills/server/SkillsBarChartLegend";
import { type ComponentProps } from "~/components/types";

import { ChartContainer } from "../../ChartContainer";

export interface SkillsBarChartContainerProps extends ComponentProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
  readonly children: ReactNode;
}

export const SkillsBarChartContainer = ({
  children,
  filters,
  limit,
  ...props
}: SkillsBarChartContainerProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
    <ChartContainer className="grow">{children}</ChartContainer>
    <Suspense>
      <SkillsBarChartLegend filters={filters} limit={limit} />
    </Suspense>
  </div>
);

export default SkillsBarChartContainer;
