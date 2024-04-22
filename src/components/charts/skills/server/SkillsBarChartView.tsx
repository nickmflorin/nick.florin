import { Suspense } from "react";

import { Loading } from "~/components/feedback/Loading";

import { SkillsBarChart } from "./SkillsBarChart";
import {
  SkillsBarChartContainer,
  type SkillsBarChartContainerProps,
} from "./SkillsBarChartContainer";

export interface SkillsBarChartViewProps extends Omit<SkillsBarChartContainerProps, "children"> {}

export const SkillsBarChartView = (props: SkillsBarChartViewProps): JSX.Element => (
  <SkillsBarChartContainer {...props}>
    <div className="w-full h-full [&_g]:cursor-pointer">
      <Suspense fallback={<Loading isLoading={true} />}>
        <SkillsBarChart filters={props.filters} limit={props.limit} />
      </Suspense>
    </div>
  </SkillsBarChartContainer>
);

export default SkillsBarChartView;
