import { z } from "zod";

import {
  ProgrammingDomain,
  ProgrammingLanguage,
  SkillCategory,
  type ApiSkill,
} from "~/database/model";

import { Form, type FormProps } from "~/components/forms-v2/Form";
import { RadioGroup } from "~/components/input/RadioGroup";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";
import { ClientExperienceSelect } from "~/features/experiences/components/input/ClientExperienceSelect";
import { ProgrammingDomainSelect } from "~/features/skills/components/input/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";

const SHOW_TOP_SKILLS = [5, 8, 12, "all"] as const;

export const ShowTopSkillsSchema = z.union([
  z.literal(5),
  z.literal(8),
  z.literal(12),
  z.literal("all"),
]);
export type ShowTopSkills = z.infer<typeof ShowTopSkillsSchema>;

export type ShowTopSkillsString = `${ShowTopSkills}`;

export const SkillsChartFilterFormSchema = z.object({
  experiences: z.array(z.string().uuid()),
  educations: z.array(z.string().uuid()),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)),
  categories: z.array(z.nativeEnum(SkillCategory)),
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
  extends Omit<FormProps<SkillsChartFilterFormValues>, "children"> {
  /* Skills would be needed if we were disabling options in selects that did not make sense
     (i.e. would result in no data).  We will revisit this later on. */
  readonly skills: ApiSkill<[]>[];
  readonly isClearDisabled?: boolean;
  readonly onClear: () => void;
}

export const SkillsChartFilterForm = ({
  form,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- See note above in props. */
  skills,
  isClearDisabled,
  onClear,
  ...props
}: SkillsChartFilterFormProps) => (
  <Form
    {...props}
    form={form}
    footer={
      <ButtonFooter
        submitButtonType="button"
        submitText="Clear Filters"
        submitIsDisabled={isClearDisabled}
        onSubmit={() => onClear()}
      />
    }
  >
    <Form.ControlledField
      form={form}
      name="showTopSkills"
      label="Show Skills"
      helpText="The number of skills that should be shown in the chart."
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
          includes={[]}
          inputClassName="w-full"
          value={value}
          onChange={onChange}
          behavior="multi"
          isClearable
          popoverPlacement="bottom"
          useAbbreviatedOptionLabels={false}
          inPortal
          onError={() => form.setErrors("experiences", "There was an error loading the data.")}
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
          behavior="multi"
          isClearable
          useAbbreviatedOptionLabels={false}
          value={value}
          onChange={onChange}
          popoverPlacement="bottom"
          // emptyContent="No options available for current search criteria."
          includes={["skills"]}
          /* itemIsVisible={education =>
               skills.some(sk => education.skills.map(s => s.id).includes(sk.id))
             } */
          onError={() => form.setErrors("educations", "There was an error loading the data.")}
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
          value={value}
          behavior="multi"
          isClearable
          popoverPlacement="bottom"
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
          value={value}
          behavior="multi"
          isClearable
          popoverPlacement="bottom"
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
          value={value}
          behavior="multi"
          isClearable
          popoverPlacement="bottom"
          inPortal
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
  </Form>
);
