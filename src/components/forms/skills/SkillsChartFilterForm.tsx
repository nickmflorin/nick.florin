import { type z } from "zod";

import { ShowTopSkillsSchema, SkillsFiltersSchema, type ShowTopSkillsString } from "~/api/schemas";
import { Form, type FormProps } from "~/components/forms/generic/Form";
import { RadioGroup } from "~/components/input/RadioGroup";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";
import { ProgrammingDomainSelect } from "~/components/input/select/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";

const SHOW_TOP_SKILLS = [5, 8, 12, "all"] as const;

export const SkillsChartFilterFormSchema = SkillsFiltersSchema.required()
  .omit({ includeInTopSkills: true, search: true })
  .extend({
    showTopSkills: ShowTopSkillsSchema,
  });

export type SkillsChartFilterFormValues = z.infer<typeof SkillsChartFilterFormSchema>;

const ShowTopSkillsLabels: { [key in ShowTopSkillsString]: string } = {
  "5": "5",
  "8": "8",
  "12": "12",
  all: "All",
};

export interface SkillsChartFilterFormProps
  extends Omit<FormProps<SkillsChartFilterFormValues>, "children"> {}

export const SkillsChartFilterForm = ({ form, ...props }: SkillsChartFilterFormProps) => (
  <Form {...props} form={form}>
    <Form.ControlledField
      form={form}
      name="showTopSkills"
      label="Show Skills"
      helpText="The number of top skills that should be shown in the chart."
      helpTextClassName="!mt-[10px]"
    >
      {({ value, onChange: _onChange }) => (
        <RadioGroup
          value={String(value) as ShowTopSkillsString}
          data={[...SHOW_TOP_SKILLS].map((v): { label: string; value: ShowTopSkillsString } => ({
            label: ShowTopSkillsLabels[String(v) as ShowTopSkillsString],
            value: String(v) as ShowTopSkillsString,
          }))}
          onChange={v =>
            _onChange?.(v === "all" ? v : (parseInt(v) as (typeof SHOW_TOP_SKILLS)[number]))
          }
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="experiences"
      label="Experiences"
      form={form}
      helpText="The professional experience(s) where the skills were acquired or used."
    >
      {({ value, onChange }) => (
        <ClientExperienceSelect
          visibility="public"
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          menuPlacement="bottom"
          useAbbreviatedOptionLabels={false}
          inPortal
          onError={() =>
            form.setStaticErrors("experiences", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="educations"
      label="Educations"
      form={form}
      helpText="The academic experience(s) where the skills were acquired or used."
    >
      {({ value, onChange }) => (
        <ClientEducationSelect
          visibility="public"
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          options={{ isMulti: true }}
          useAbbreviatedOptionLabels={false}
          value={value}
          onChange={onChange}
          menuPlacement="bottom"
          inPortal
          onError={() => form.setStaticErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="programmingDomains"
      label="Domains"
      form={form}
      helpText="The specific development stack(s) that the skill pertains to, if applicable."
    >
      {({ value, onChange }) => (
        <ProgrammingDomainSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="programmingLanguages"
      label="Languages"
      form={form}
      helpText="The programming language(s) that the skills pertain to, if applicable."
    >
      {({ value, onChange }) => (
        <ProgrammingLanguageSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="categories"
      label="Categories"
      form={form}
      helpText="The category or categories that the skills belong to."
    >
      {({ value, onChange }) => (
        <SkillCategorySelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default SkillsChartFilterForm;
