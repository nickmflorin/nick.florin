import { Suspense } from "react";

import qs from "qs";

import { Loading } from "~/components/feedback/Loading";

import { SkillsBarChart } from "./SkillsBarChart";
import {
  SkillsBarChartContainer,
  type SkillsBarChartContainerProps,
} from "./SkillsBarChartContainer";

export interface SkillsBarChartViewProps extends Omit<SkillsBarChartContainerProps, "children"> {}

export const SkillsBarChartView = (props: SkillsBarChartViewProps): JSX.Element => (
  <SkillsBarChartContainer {...props}>
    <Suspense
      key={qs.stringify(props.filters) + "_" + String(props.limit)}
      fallback={<Loading isLoading={true} />}
    >
      <SkillsBarChart filters={props.filters} limit={props.limit} />
    </Suspense>
  </SkillsBarChartContainer>
);

export default SkillsBarChartView;
