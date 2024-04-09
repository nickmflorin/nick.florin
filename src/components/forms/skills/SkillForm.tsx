"use client";
import { type z } from "zod";

import { SkillSchema } from "~/api/schemas";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";
import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import { ProgrammingDomainSelect } from "~/components/input/select/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { CheckboxField } from "../fields/CheckboxField";
import { Form, type FormProps } from "../generic/Form";

export const SkillFormSchema = SkillSchema.required();

export type SkillFormValues = z.infer<typeof SkillFormSchema>;

export const SkillFormDefaultValues: SkillFormValues = {
  label: "",
  slug: "",
  description: "",
  experiences: [],
  educations: [],
  categories: [],
  projects: [],
  programmingDomains: [],
  programmingLanguages: [],
  includeInTopSkills: false,
  experience: null,
  visible: true,
};

export interface SkillFormProps
  extends Omit<FormProps<SkillFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const SkillForm = (props: SkillFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field name="label" label="Label" form={props.form} condition="required">
      <TextInput className="w-full" {...props.form.register("label")} />
    </Form.Field>
    <Form.Field
      name="slug"
      label="Slug"
      form={props.form}
      helpText="If not provided, will be auto generated based on the label."
    >
      <TextInput className="w-full" {...props.form.register("slug")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} rows={4} />
    </Form.Field>
    <Form.ControlledField name="experiences" label="Experiences" form={props.form}>
      {({ value, onChange }) => (
        <ClientExperienceSelect
          visibility="admin"
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("educations", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="educations" label="Educations" form={props.form}>
      {({ value, onChange }) => (
        <ClientEducationSelect
          visibility="admin"
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          options={{ isMulti: true }}
          value={value}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("educations", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="projects" label="Projects" form={props.form}>
      {({ value, onChange }) => (
        <ClientProjectSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          options={{ isMulti: true }}
          value={value}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("projects", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <CheckboxField name="visible" form={props.form} label="Visible" />
      <CheckboxField name="includeInTopSkills" form={props.form} label="Top Skill" />
    </div>
    <Form.ControlledField name="programmingDomains" label="Domains" form={props.form}>
      {({ value, onChange }) => (
        <ProgrammingDomainSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="programmingLanguages" label="Languages" form={props.form}>
      {({ value, onChange }) => (
        <ProgrammingLanguageSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="categories" label="Categories" form={props.form}>
      {({ value, onChange }) => (
        <SkillCategorySelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          menuPlacement="top"
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default SkillForm;
