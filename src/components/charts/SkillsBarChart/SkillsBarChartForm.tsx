import clsx from "clsx";
import { type z } from "zod";

import { SHOW_TOP_SKILLS, type ShowTopSkills, type ShowTopSkillsString } from "~/app/api/types";
import { Form, type FormProps } from "~/components/forms/Form";
import { RadioGroup } from "~/components/input/RadioGroup";

import { type SkillsBarChartFormSchema } from "./types";

const ShowTopSkillsLabels: { [key in ShowTopSkillsString]: string } = {
  "5": "5",
  "8": "8",
  "12": "12",
  all: "All",
};

export interface SkillsBarChartFormProps
  extends Omit<FormProps<z.infer<typeof SkillsBarChartFormSchema>>, "children"> {}

export const SkillsBarChartForm = ({ form, ...props }: SkillsBarChartFormProps) => (
  <Form {...props} form={form} isScrollable={false}>
    <Form.ControlledField form={form} name="showTopSkills" label="Show # Skills">
      {({ value, onChange: _onChange }) => (
        <RadioGroup
          value={String(value) as ShowTopSkillsString}
          data={[...SHOW_TOP_SKILLS].map((v): { label: string; value: ShowTopSkillsString } => ({
            label: ShowTopSkillsLabels[String(v) as ShowTopSkillsString],
            value: String(v) as ShowTopSkillsString,
          }))}
          onChange={v => _onChange?.(v === "all" ? v : (parseInt(v) as ShowTopSkills))}
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default SkillsBarChartForm;
