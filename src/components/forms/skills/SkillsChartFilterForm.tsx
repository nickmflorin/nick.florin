import { z } from "zod";

import { ProgrammingDomain, SkillCategory, ProgrammingLanguage } from "~/prisma/model";
import { SHOW_TOP_SKILLS, type ShowTopSkills, type ShowTopSkillsString } from "~/app/api/types";
import { Form, type FormProps } from "~/components/forms/generic/Form";
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
      helpTextClassName="mt-[10px]"
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
    <Form.ControlledField
      name="experiences"
      label="Experiences"
      form={form}
      helpText="The professional experiences where the skills were acquired or used."
    >
      {({ value, onChange }) => (
        <ClientExperienceSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          placement="bottom"
          useAbbreviatedOptionLabels={false}
          inPortal
          onError={() => form.setStaticErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="educations"
      label="Educations"
      form={form}
      helpText="The academic experiences where the skills were acquired or used."
    >
      {({ value, onChange }) => (
        <ClientEducationSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          useAbbreviatedOptionLabels={false}
          value={value}
          onChange={onChange}
          placement="bottom"
          inPortal
          onError={() => form.setStaticErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="programmingDomains"
      label="Domains"
      form={form}
      helpText="The specific development stack that the skills pertains to, if applicable."
    >
      {({ value, onChange }) => (
        <ProgrammingDomainSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="programmingLanguages"
      label="Languages"
      form={form}
      helpText="The specific programming languages that the skills pertains to, if applicable."
    >
      {({ value, onChange }) => (
        <ProgrammingLanguageSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      name="categories"
      label="Categories"
      form={form}
      helpText="Categories that the skills belongs to."
    >
      {({ value, onChange }) => (
        <SkillCategorySelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          placement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default SkillsChartFilterForm;
