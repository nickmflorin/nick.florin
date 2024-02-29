"use client";
import { type z } from "zod";

import { ExperienceSchema } from "~/actions/schemas";
import { Checkbox } from "~/components/input/Checkbox";
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
    <Form.Field name="shortTitle" label="Short Title" form={props.form}>
      <TextInput className="w-full" {...props.form.register("shortTitle")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} />
    </Form.Field>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <Form.ControlledField name="isRemote" form={props.form} className="max-w-fit">
        {({ value, onChange }) => (
          <div className="flex flex-row gap-[6px] items-center">
            <Checkbox value={value} onChange={onChange} />
            <Label size="sm" fontWeight="medium" className="leading-[16px]">
              Visible
            </Label>
          </div>
        )}
      </Form.ControlledField>
    </div>
  </Form>
);

export default ExperienceForm;
