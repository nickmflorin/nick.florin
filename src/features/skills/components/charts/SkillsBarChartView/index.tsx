import type { ApiSkill } from "~/database/model";

import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { ClientSkillsBarChart } from "./ClientSkillsBarChart";
import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

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
      id="skills-bar-chart-element"
      className={classNames("relative", "max-md:h-[340px]", "md:max-lg:h-[500px]", "lg:h-[600px]")}
    >
      <ClientSkillsBarChart skills={skills} />
    </div>
    <SkillsBarChartLegend skills={skills} />
  </div>
);

export default SkillsBarChartView;
