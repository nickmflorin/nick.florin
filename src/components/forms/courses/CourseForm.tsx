"use client";
import { type z } from "zod";

import { CourseSchema } from "~/api/schemas";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "../generic/Form";

export const CourseFormSchema = CourseSchema.required();

export type CourseFormValues = z.infer<typeof CourseFormSchema>;

export interface CourseFormProps
  extends Omit<FormProps<CourseFormValues>, "children" | "onSubmit" | "contentClassName"> {}

/*
TODO
(1) Improving slug input.
(2) Adding ability to modify skills from this form.
*/
export const CourseForm = (props: CourseFormProps): JSX.Element => (
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
    <Form.ControlledField
      name="education"
      label="Education"
      labelProps={{ size: "xs" }}
      form={props.form}
      helpText="The educational experience in which the course was taken."
    >
      {({ value, onChange }) => (
        <ClientEducationSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          options={{ isMulti: false }}
          useAbbreviatedOptionLabels={false}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("education", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
  </Form>
);

export default CourseForm;
