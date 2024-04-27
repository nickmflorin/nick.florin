import { Suspense } from "react";

import clsx from "clsx";
import qs from "qs";

import type { SkillsFilters } from "~/api/schemas";
import { Loading } from "~/components/feedback/Loading";

import { ChartContainer, type ChartContainerProps } from "../ChartContainer";

import { SkillsBarChart } from "./SkillsBarChart";
import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

export interface SkillsBarChartViewProps extends Omit<ChartContainerProps, "children"> {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

export const SkillsBarChartView = ({
  filters,
  limit,
  minHeight,
  maxHeight,
  height,
  ...props
}: SkillsBarChartViewProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      // "flex gap-[8px] h-full w-full max-h-full max-w-full",
      "flex gap-[8px] h-full w-full max-h-full max-w-full",
      "xl:flex-col",
      "md:max-xl:flex-row",
      "max-md:flex-col",

      "[&_g]:cursor-pointer",
      "xl:w-full xl:max-w-full",
      // "max-xl:max-w-[calc(100%-390px)]",
      props.className,
    )}
  >
    {/* <ChartContainer
      className={clsx(
        "grow [&_g]:cursor-pointer",
        "xl:w-full xl:max-w-full",
        "max-xl:min-w-[60%] max-xl:h-full max-xl:max-w-[calc(100%-390px)]",
        "max-md:w-full max-md:max-w-full max-md:min-h-[300px]",
      )}
      minHeight={minHeight}
      maxHeight={maxHeight}
      height={height}
    > */}
    <Suspense
      key={qs.stringify(filters) + "_" + String(limit)}
      fallback={<Loading isLoading={true} />}
    >
      <div className="max-md:h-[400px] md:max-lg:h-[500px] lg:h-[600px]">
        <SkillsBarChart filters={filters} limit={limit} />
      </div>
    </Suspense>
    {/* </ChartContainer> */}
    <Suspense key={qs.stringify(filters) + "_" + String(limit)}>
      <div
        className={clsx(
          "min-w-[220px]",
          "xl:px-[20px] xl:max-w-full",
          "max-md:px-[20px] max-md:max-w-full",
          "md:max-xl:max-h-full md:max-xl:overflow-y-auto md:max-xl:max-w-[390px]",
        )}
      >
        <SkillsBarChartLegend filters={filters} limit={limit} />
      </div>
    </Suspense>
  </div>
);

export default SkillsBarChartView;
