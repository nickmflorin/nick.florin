import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { TopSkillsRadioGroup } from "./TopSkillsRadioGroup";

export interface SkillsBarChartControlProps extends ComponentProps {}

export const SkillsBarChartControl = (props: SkillsBarChartControlProps) => (
  <div className={clsx("flex flex-col gap-[4px]", props.className)}>
    <TopSkillsRadioGroup />
  </div>
);

export default SkillsBarChartControl;
