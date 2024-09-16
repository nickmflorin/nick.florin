"use client";
import { useEffect } from "react";

import { useWatch } from "react-hook-form";
import { type z } from "zod";

import { slugify } from "~/lib/formatters";

import { SkillSchema } from "~/api/schemas";

import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { Form, type FormProps } from "~/components/forms/Form";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { CourseSelect } from "~/features/courses/components/input/CourseSelect";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";
import { ClientExperienceSelect } from "~/features/experiences/components/input/ClientExperienceSelect";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { RepositorySelect } from "~/features/repositories/components/input/RepositorySelect";
import { ProgrammingDomainSelect } from "~/features/skills/components/input/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";

export const SkillFormSchema = SkillSchema.required();

export type SkillFormValues = z.infer<typeof SkillFormSchema>;

export interface SkillFormProps
  extends Omit<FormProps<SkillFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const SkillForm = (props: SkillFormProps): JSX.Element => {
  const _labelValue = useWatch({ control: props.form.control, name: "label" });

  useEffect(() => {
    props.form.setValue("slug", slugify(_labelValue));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [_labelValue]);

  return (
    <Form {...props} contentClassName="gap-[12px]">
      <Form.Field name="label" label="Label" form={props.form} condition="required">
        <TextInput className="w-full" {...props.form.register("label")} />
      </Form.Field>
      <Form.Field
        name="slug"
        label="Slug"
        form={props.form}
        helpText="If left blank, the slug will be automatically generated based on the label."
      >
        <TextInput className="w-full" {...props.form.register("slug")} />
      </Form.Field>
      <Form.Field name="description" label="Description" form={props.form}>
        <TextArea className="w-full" {...props.form.register("description")} rows={4} />
      </Form.Field>
      <Form.Field
        name="experience"
        label="Experience"
        form={props.form}
        helpText="If left blank, the experience will be automatically calculated."
      >
        <TextInput className="w-full" {...props.form.register("experience")} />
      </Form.Field>
      <Form.ControlledField name="experiences" label="Experiences" form={props.form}>
        {({ value, onChange }) => (
          <ClientExperienceSelect
            visibility="admin"
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            behavior="multi"
            isClearable
            value={value}
            onChange={onChange}
            inPortal
            onError={() =>
              props.form.setErrors("educations", "There was an error loading the data.")
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
            behavior="multi"
            isClearable
            value={value}
            onChange={onChange}
            inPortal
            onError={() =>
              props.form.setErrors("educations", "There was an error loading the data.")
            }
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField name="projects" label="Projects" form={props.form}>
        {({ value, onChange }) => (
          <ProjectSelect
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            behavior="multi"
            isClearable
            value={value}
            onChange={onChange}
            inPortal
            onError={() => props.form.setErrors("projects", "There was an error loading the data.")}
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField name="repositories" label="Repositories" form={props.form}>
        {({ value, onChange }) => (
          <RepositorySelect
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            behavior="multi"
            isClearable
            value={value}
            onChange={onChange}
            inPortal
            onError={() =>
              props.form.setErrors("repositories", "There was an error loading the data.")
            }
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField name="courses" label="Courses" form={props.form}>
        {({ value, onChange }) => (
          <CourseSelect
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            behavior="multi"
            isClearable
            value={value}
            onChange={onChange}
            inPortal
            onError={() => props.form.setErrors("courses", "There was an error loading the data.")}
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
            behavior="multi"
            isClearable
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
            behavior="multi"
            isClearable
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
            behavior="multi"
            isClearable
            menuPlacement="top"
            onChange={onChange}
          />
        )}
      </Form.ControlledField>
    </Form>
  );
};

export default SkillForm;