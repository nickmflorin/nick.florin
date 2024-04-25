import { type ReactNode, Suspense } from "react";

import clsx from "clsx";
import qs from "qs";

import type { SkillsFilters } from "~/api/schemas";

import { ChartContainer, type ChartContainerProps } from "../ChartContainer";

import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

export interface SkillsBarChartContainerProps extends ChartContainerProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
  readonly children: ReactNode;
}

export const SkillsBarChartContainer = ({
  children,
  filters,
  limit,
  className,
  style,
  ...props
}: SkillsBarChartContainerProps): JSX.Element => (
  <div style={style} className={clsx("flex flex-col gap-[8px]", className)}>
    <ChartContainer className="grow" {...props}>
      {children}
    </ChartContainer>
    <Suspense key={qs.stringify(filters) + "_" + String(limit)}>
      <SkillsBarChartLegend filters={filters} limit={limit} />
    </Suspense>
  </div>
);

export default SkillsBarChartContainer;
