"use client";
import { type z } from "zod";

import { EducationSchema } from "~/actions/schemas";
import { Checkbox } from "~/components/input/Checkbox";
import { ClientSchoolSelect } from "~/components/input/select/ClientSchoolSelect";
import { DegreeSelect } from "~/components/input/select/DegreeSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { Form, type FormProps } from "../Form";

export const EducationFormSchema = EducationSchema.required();

export type EducationFormValues = z.infer<typeof EducationFormSchema>;

export interface EducationFormProps
  extends Omit<FormProps<EducationFormValues>, "children" | "onSubmit"> {}

export const EducationForm = (props: EducationFormProps): JSX.Element => (
  <Form {...props} contentClassName="gap-[12px]">
    <Form.Field name="major" label="Major" form={props.form} condition="required">
      <TextInput className="w-full" {...props.form.register("major")} />
    </Form.Field>
    <Form.Field
      name="major"
      label="Short Major"
      form={props.form}
      helpText={
        "An abbreviated version of the major.  This is used for data " +
        "entry components in the admin."
      }
    >
      <TextInput className="w-full" {...props.form.register("shortMajor")} />
    </Form.Field>
    <Form.ControlledField name="degree" label="Degree" form={props.form}>
      {({ value, onChange }) => (
        <DegreeSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
        />
      )}
    </Form.ControlledField>
    <Form.Field name="minor" label="Minor" form={props.form}>
      <TextInput className="w-full" {...props.form.register("minor")} />
    </Form.Field>
    <Form.Field name="concentration" label="Concentration" form={props.form}>
      <TextInput className="w-full" {...props.form.register("concentration")} />
    </Form.Field>
    <Form.Field name="description" label="Description" form={props.form}>
      <TextArea className="w-full" {...props.form.register("description")} />
    </Form.Field>
    <Form.Field name="note" label="Note" form={props.form}>
      <TextArea className="w-full" {...props.form.register("note")} />
    </Form.Field>
    <Form.ControlledField name="school" label="School" form={props.form} condition="required">
      {({ value, onChange }) => (
        <ClientSchoolSelect
          inputClassName="w-full"
          menuClassName="max-h-[260px]"
          value={value}
          onChange={onChange}
          inPortal
          onError={() =>
            props.form.setStaticErrors("school", "There was an error loading the data.")
          }
        />
      )}
    </Form.ControlledField>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <Form.ControlledField name="postPoned" form={props.form} className="max-w-fit">
        {({ value, onChange }) => (
          <div className="flex flex-row gap-[6px] items-center">
            <Checkbox value={value} onChange={onChange} />
            <Label size="sm" fontWeight="medium" className="leading-[16px]">
              Post Poned
            </Label>
          </div>
        )}
      </Form.ControlledField>
    </div>
  </Form>
);

export default EducationForm;
