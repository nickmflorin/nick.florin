"use client";
import { Checkboxes } from "~/components/forms/fields/Checkboxes";
import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { Form, type FormProps } from "~/components/forms/Form";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { ClientProjectSelect } from "~/features/projects/components/input/ClientProjectSelect";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

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
          visibility="admin"
          behavior="multi"
          isClearable
          inputClassName="w-full"
          value={value}
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="skills" label="Skills" form={props.form}>
      {({ value, onChange }) => (
        <ClientSkillsSelect
          behavior="multi"
          visibility="admin"
          inputClassName="w-full"
          value={value}
          onChange={onChange}
        />
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
    <Checkboxes outer>
      <CheckboxField
        name="highlighted"
        form={props.form}
        label="Highlighted"
        onChange={e => {
          if (e.target.checked) {
            props.form.setValue("visible", true);
          }
        }}
      />
      <CheckboxField
        name="visible"
        form={props.form}
        label="Visible"
        onChange={e => {
          if (!e.target.checked) {
            props.form.setValue("highlighted", false);
          }
        }}
      />
    </Checkboxes>
  </Form>
);

export default RepositoryForm;
