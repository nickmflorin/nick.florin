import { z } from "zod";

import { ProgrammingDomain, SkillCategory, ProgrammingLanguage } from "~/prisma/model";
import { SHOW_TOP_SKILLS, type ShowTopSkills, type ShowTopSkillsString } from "~/app/api/types";
import { Form, type FormProps } from "~/components/forms/Form";
import { RadioGroup } from "~/components/input/RadioGroup";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";
import { ProgrammingDomainSelect } from "~/components/input/select/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";

export const SkillsChartFilterFormSchema = z.object({
  showTopSkills: z.union([z.literal(5), z.literal(8), z.literal(12), z.literal("all")]),
  experiences: z.array(z.string()),
  educations: z.array(z.string()),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)),
  categories: z.array(z.nativeEnum(SkillCategory)),
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
  <Form {...props} form={form} isScrollable={false}>
    <Form.ControlledField
      form={form}
      name="showTopSkills"
      label="Show Skills"
      helpText="The number of top skills that should be shown in the chart."
    >
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
    <Form.ControlledField name="experiences" label="Experiences" form={form}>
      {({ value, onChange }) => (
        <ClientExperienceSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          /* TODO: We need to figure out how to make this static so it doesn't clear with other
             errors that will auto clear on submit. */
          onError={() => form.setErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="educations" label="Educations" form={form}>
      {({ value, onChange }) => (
        <ClientEducationSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          /* TODO: We need to figure out how to make this static so it doesn't clear with other
             errors that will auto clear on submit. */
          onError={() => form.setErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="programmingDomains" label="Domains" form={form}>
      {({ value, onChange }) => (
        <ProgrammingDomainSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="programmingLanguages" label="Languages" form={form}>
      {({ value, onChange }) => (
        <ProgrammingLanguageSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="categories" label="Categories" form={form}>
      {({ value, onChange }) => (
        <SkillCategorySelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default SkillsChartFilterForm;
