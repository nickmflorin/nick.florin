"use client";
import { type z } from "zod";

import { ProjectSchema } from "~/api/schemas";
import { DateSelect } from "~/components/input/dates/DateSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "../generic/Form";

export const ProjectFormSchema = ProjectSchema.required();

export type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

export interface ProjectFormProps
  extends Omit<FormProps<ProjectFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const ProjectForm = (props: ProjectFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field name="name" label="Name" form={props.form}>
      <TextInput className="w-full" {...props.form.register("name")} />
    </Form.Field>
    <Form.Field name="shortName" label="Name (Abbv.)" form={props.form}>
      <TextInput className="w-full" {...props.form.register("shortName")} />
    </Form.Field>
    <Form.Field
      name="slug"
      label="Slug"
      form={props.form}
      helpText="If not provided, will be auto generated based on the name."
    >
      <TextInput className="w-full" {...props.form.register("slug")} />
    </Form.Field>
    <Form.Field
      name="icon"
      label="Icon"
      form={props.form}
      helpText="The FontAwesome name of the icon that the project should be associated with."
    >
      <TextInput className="w-full" {...props.form.register("icon")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} rows={4} />
    </Form.Field>
    <Form.ControlledField
      name="startDate"
      label="Start Date"
      form={props.form}
      helpText={
        "The date that the project started.  Used for determining the " +
        "experience for skills associated with the project."
      }
    >
      {({ value, onChange }) => (
        <DateSelect inputClassName="w-full" value={value} onChange={onChange} inPortal />
      )}
    </Form.ControlledField>
  </Form>
);

export default ProjectForm;
