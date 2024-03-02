"use client";
import { type z } from "zod";

import { ExperienceSchema } from "~/actions/schemas";
import { Checkbox } from "~/components/input/Checkbox";
import { ClientCompanySelect } from "~/components/input/select/ClientCompanySelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { Form, type FormProps } from "../Form";

export const ExperienceFormSchema = ExperienceSchema.required();

export type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>;

export interface ExperienceFormProps
  extends Omit<FormProps<ExperienceFormValues>, "children" | "onSubmit"> {}

export const ExperienceForm = (props: ExperienceFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field name="title" label="Title" form={props.form} condition="required">
      <TextInput className="w-full" {...props.form.register("title")} />
    </Form.Field>
    <Form.Field
      name="shortTitle"
      label="Short Title"
      form={props.form}
      helpText={
        "An abbreviated version of the title.  This is used for data " +
        "entry components in the admin."
      }
    >
      <TextInput className="w-full" {...props.form.register("shortTitle")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} rows={4} />
    </Form.Field>
    <Form.ControlledField name="company" label="Company" form={props.form} condition="required">
      {({ value, onChange }) => (
        <ClientCompanySelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("company", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <Form.ControlledField name="isRemote" form={props.form} className="max-w-fit">
        {({ value, onChange }) => (
          <div className="flex flex-row gap-[6px] items-center">
            <Checkbox value={value} onChange={onChange} />
            <Label size="sm" fontWeight="medium" className="leading-[16px]">
              Remote
            </Label>
          </div>
        )}
      </Form.ControlledField>
    </div>
  </Form>
);

export default ExperienceForm;
