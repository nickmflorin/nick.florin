import { Suspense } from "react";

import clsx from "clsx";
import qs from "qs";

import type { SkillsFilters } from "~/api/schemas";
import { Loading } from "~/components/feedback/Loading";
import type { ComponentProps } from "~/components/types";

import { SkillsBarChart } from "./SkillsBarChart";
import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

export const SkillsBarChartView = ({
  filters,
  limit,
  ...props
}: SkillsBarChartViewProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      "flex gap-[8px] h-full w-full max-h-full max-w-full",
      "xl:flex-col",
      "md:max-xl:flex-row",
      "max-md:flex-col",
      "[&_g]:cursor-pointer",
      "xl:w-full xl:max-w-full",
      props.className,
    )}
  >
    <div
      className={clsx(
        "relative",
        "md:max-lg:w-[420px] md:max-lg:h-[500px]",
        "max-md:h-[400px]",
        "lg:h-[600px] lg:max-xl:w-[640px]",
      )}
    >
      <Suspense
        key={qs.stringify(filters) + "_" + String(limit)}
        fallback={<Loading isLoading={true} />}
      >
        <SkillsBarChart filters={filters} limit={limit} />
      </Suspense>
    </div>
    <Suspense key={qs.stringify(filters) + "_" + String(limit)}>
      <div
        className={clsx(
          "xl:px-[10px] xl:max-w-full",
          "max-md:px-[10px] max-md:max-w-full",
          "md:max-xl:max-h-full md:max-xl:overflow-y-auto md:max-xl:max-w-[390px]",
        )}
      >
        <SkillsBarChartLegend filters={filters} limit={limit} />
      </div>
    </Suspense>
  </div>
);

export default SkillsBarChartView;
