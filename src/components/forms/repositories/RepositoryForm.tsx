"use client";
import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "../generic/Form";

import { type RepositoryFormValues } from "./schema";

export interface RepositoryFormProps
  extends Omit<FormProps<RepositoryFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const RepositoryForm = (props: RepositoryFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field
      name="slug"
      label="Slug"
      form={props.form}
      helpText="This must match the slug in Github."
    >
      <TextInput className="w-full" {...props.form.register("slug")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} rows={4} />
    </Form.Field>
    <Form.ControlledField name="projects" label="Projects" form={props.form}>
      {({ value, onChange }) => (
        <ClientProjectSelect
          options={{ isMulti: true, isClearable: true }}
          inputClassName="w-full"
          value={value}
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="skills" label="Skills" form={props.form}>
      {({ value, onChange }) => (
        <SkillsSelect inputClassName="w-full" value={value} onChange={onChange} />
      )}
    </Form.ControlledField>
    <Form.Field
      name="npmPackageName"
      label="NPM Package Name"
      form={props.form}
      helpText="The name of the package on npm (if applicable)."
    >
      <TextInput className="w-full" {...props.form.register("npmPackageName")} />
    </Form.Field>
    <div className="flex flex-col gap-[16px] mt-[6px]">
      <CheckboxField name="highlighted" form={props.form} label="Highlighted" />
      <CheckboxField name="visible" form={props.form} label="Visible" />
    </div>
  </Form>
);

export default RepositoryForm;
