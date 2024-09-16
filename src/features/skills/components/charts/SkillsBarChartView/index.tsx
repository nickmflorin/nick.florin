import { Suspense } from "react";

import { Loading } from "~/components/loading/Loading";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import {
  SkillsBarChartViewContent,
  type SkillsBarChartViewContentProps,
} from "./SkillsBarChartViewContent";

export interface SkillsBarChartViewProps extends SkillsBarChartViewContentProps, ComponentProps {}

export const SkillsBarChartView = async ({
  filters,
  limit,
  ...props
}: SkillsBarChartViewProps): Promise<JSX.Element> => (
  <div
    {...props}
    className={classNames(
      "skills-bar-chart-view flex flex-col gap-[8px] h-full w-full max-h-full max-w-full",
      "[&_g]:cursor-pointer",
      props.className,
    )}
  >
    <Suspense
      fallback={<Loading isLoading={true} />}
      key={JSON.stringify(filters) + "_" + JSON.stringify(limit)}
    >
      <SkillsBarChartViewContent filters={filters} limit={limit} />
    </Suspense>
  </div>
);

export default SkillsBarChartView;
