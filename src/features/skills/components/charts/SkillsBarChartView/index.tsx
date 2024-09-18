import dynamic from "next/dynamic";

import type { ApiSkill } from "~/database/model";

import { Loading } from "~/components/loading/Loading";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

const Chart = dynamic(() => import("./ClientSkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
});

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly skills: ApiSkill<[]>[];
}

export const SkillsBarChartView = ({ skills, ...props }: SkillsBarChartViewProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "skills-bar-chart-view flex flex-col gap-[8px] h-full w-full max-h-full max-w-full",
      "[&_g]:cursor-pointer",
      props.className,
    )}
  >
    <div
      className={classNames("relative", "max-md:h-[340px]", "md:max-lg:h-[500px]", "lg:h-[600px]")}
    >
      <Chart skills={skills} />
    </div>
    <SkillsBarChartLegend skills={skills} />
  </div>
);

export default SkillsBarChartView;
