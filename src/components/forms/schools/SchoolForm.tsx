"use client";
import { type z } from "zod";

import { SchoolSchema } from "~/api/schemas";

import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "../generic/Form";

export const SchoolFormSchema = SchoolSchema.required();

export type SchoolFormValues = z.infer<typeof SchoolFormSchema>;

export interface SchoolFormProps
  extends Omit<FormProps<SchoolFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const SchoolForm = (props: SchoolFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field name="name" label="Name" form={props.form}>
      <TextInput className="w-full" {...props.form.register("name")} />
    </Form.Field>
    <Form.Field name="shortName" label="Name (Abbv.)" form={props.form}>
      <TextInput className="w-full" {...props.form.register("shortName")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} rows={4} />
    </Form.Field>
    <Form.Field name="logoImageUrl" label="Logo URL" form={props.form}>
      <TextInput className="w-full" {...props.form.register("logoImageUrl")} />
    </Form.Field>
    <Form.Field name="websiteUrl" label="Website URL" form={props.form}>
      <TextInput className="w-full" {...props.form.register("websiteUrl")} />
    </Form.Field>
    <Form.Field name="city" label="City" form={props.form}>
      <TextInput className="w-full" {...props.form.register("city")} />
    </Form.Field>
    <Form.Field name="state" label="State" form={props.form}>
      <TextInput className="w-full" {...props.form.register("state")} />
    </Form.Field>
  </Form>
);

export default SchoolForm;
