"use client";
import { type z } from "zod";

import { SkillSchema } from "~/actions/schemas";
import { Checkbox } from "~/components/input/Checkbox";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";
import { ProgrammingDomainSelect } from "~/components/input/select/ProgrammingDomainSelect";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { Form, type FormProps } from "../Form";

export const SkillFormSchema = SkillSchema.required();

export type SkillFormValues = z.infer<typeof SkillFormSchema>;

export interface SkillFormProps extends Omit<FormProps<SkillFormValues>, "children" | "onSubmit"> {}

export const SkillForm = (props: SkillFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]" submitButtonType="submit">
    <Form.Field name="label" label="Label" form={props.form}>
      <TextInput className="w-full" {...props.form.register("label")} />
    </Form.Field>
    <Form.Field name="slug" label="Slug" form={props.form}>
      <TextInput className="w-full" {...props.form.register("slug")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} />
    </Form.Field>
    <Form.ControlledField name="experiences" label="Experiences" form={props.form}>
      {({ value, onChange }) => (
        <ClientExperienceSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          /* TODO: We need to figure out how to make this static so it doesn't clear with other
             errors that will auto clear on submit. */
          onError={() => props.form.setErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="educations" label="Educations" form={props.form}>
      {({ value, onChange }) => (
        <ClientEducationSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          /* TODO: We need to figure out how to make this static so it doesn't clear with other
             errors that will auto clear on submit. */
          onError={() => props.form.setErrors("educations", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <Form.ControlledField name="visible" form={props.form} className="max-w-fit">
        {({ value, onChange }) => (
          <div className="flex flex-row gap-[6px] items-center">
            <Checkbox value={value} onChange={onChange} />
            <Label size="sm" fontWeight="medium" className="leading-[16px]">
              Visible
            </Label>
          </div>
        )}
      </Form.ControlledField>
      <Form.ControlledField name="includeInTopSkills" form={props.form} className="max-w-fit">
        {({ value, onChange }) => (
          <div className="flex flex-row gap-[6px] items-center">
            <Checkbox value={value} onChange={onChange} />
            <Label size="sm" fontWeight="medium" className="leading-[16px]">
              Top Skill
            </Label>
          </div>
        )}
      </Form.ControlledField>
    </div>
    <Form.ControlledField name="programmingDomains" label="Domains" form={props.form}>
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
    <Form.ControlledField name="programmingLanguages" label="Languages" form={props.form}>
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
    <Form.ControlledField name="categories" label="Categories" form={props.form}>
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

export default SkillForm;
