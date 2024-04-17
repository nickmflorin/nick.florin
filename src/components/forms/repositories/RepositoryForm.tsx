"use client";
import { type z } from "zod";

import { RepositorySchema } from "~/api/schemas";
import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "../generic/Form";

export const RepositoryFormSchema = RepositorySchema.required();

export type RepositoryFormValues = z.infer<typeof RepositoryFormSchema>;

export interface RepositoryFormProps
  extends Omit<FormProps<RepositoryFormValues>, "children" | "onSubmit" | "contentClassName"> {}

// TODO: Add ability to specify skills in form.
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
          options={{ isMulti: true }}
          inputClassName="w-full"
          value={value}
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <CheckboxField name="visible" form={props.form} label="Visible" />
  </Form>
);

export default RepositoryForm;
