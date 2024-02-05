import clsx from "clsx";

import {
  SHOW_TOP_SKILLS,
  type ShowTopSkills,
  type ShowTopSkillsString,
  type SkillQuery,
} from "~/app/api/types";
import { RadioGroup } from "~/components/input/RadioGroup";
import { type ComponentProps } from "~/components/types";

export interface SkillsBarChartControlProps extends ComponentProps {
  readonly value: SkillQuery;
  readonly onChange?: (query: SkillQuery) => void;
}

const ShowTopSkillsLabels: { [key in ShowTopSkillsString]: string } = {
  "5": "5",
  "8": "8",
  "12": "12",
  all: "All",
};

export const SkillsBarChartControl = ({
  value,
  onChange,
  ...props
}: SkillsBarChartControlProps) => (
  <div {...props} className={clsx("flex flex-col gap-[4px]", props.className)}>
    <RadioGroup
      value={String(value.showTopSkills) as ShowTopSkillsString}
      data={[...SHOW_TOP_SKILLS].map((v): { label: string; value: ShowTopSkillsString } => ({
        label: ShowTopSkillsLabels[String(v) as ShowTopSkillsString],
        value: String(v) as ShowTopSkillsString,
      }))}
      onChange={v => {
        /* TODO: We might need to use a Form for this type of mechanical implementation.  This,
           in general, is not super safe. */
        onChange?.({ ...value, showTopSkills: v === "all" ? v : (parseInt(v) as ShowTopSkills) });
      }}
    />
  </div>
);

export default SkillsBarChartControl;
