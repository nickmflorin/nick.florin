"use client";
import { useState, useEffect } from "react";

import { useWatch } from "react-hook-form";
import { type z } from "zod";

import { ExperienceSchema } from "~/api/schemas";
import { Checkbox } from "~/components/input/Checkbox";
import { DateSelect } from "~/components/input/dates/DateSelect";
import { ClientCompanySelect } from "~/components/input/select/ClientCompanySelect";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { CheckboxField } from "../fields/CheckboxField";
import { Form, type FormProps } from "../generic/Form";

export const ExperienceFormSchema = ExperienceSchema.required();

export type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>;

export interface ExperienceFormProps
  extends Omit<FormProps<ExperienceFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const ExperienceForm = (props: ExperienceFormProps): JSX.Element => {
  const endDate = useWatch({ control: props.form.control, name: "endDate" });

  const [isCurrent, setIsCurrent] = useState(endDate === null);

  useEffect(() => {
    setIsCurrent(endDate === null);
  }, [endDate]);

  return (
    <Form
      {...props}
      contentClassName="gap-[12px]"
      action={(data, form) => {
        if (isCurrent) {
          props.action?.({ ...data, endDate: null }, form);
        } else {
          props.action?.(data, form);
        }
      }}
    >
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
      <Form.ControlledField name="skills" label="Skills" form={props.form}>
        {({ value, onChange }) => (
          <SkillsSelect inputClassName="w-full" value={value} onChange={onChange} />
        )}
      </Form.ControlledField>
      <Form.ControlledField name="startDate" label="Start Date" form={props.form}>
        {({ value, onChange }) => (
          <DateSelect inputClassName="w-full" value={value} onChange={onChange} />
        )}
      </Form.ControlledField>
      <div className="flex flex-row gap-[6px] items-center mt-[8px] mb-[8px]">
        <Checkbox value={isCurrent} onChange={e => setIsCurrent(e.target.checked)} />
        <Label size="sm" fontWeight="medium" className="leading-[16px]">
          Current
        </Label>
      </div>
      <Form.ControlledField name="endDate" label="End Date" form={props.form}>
        {({ value, onChange }) => (
          <DateSelect
            inputClassName="w-full"
            value={value}
            onChange={onChange}
            isDisabled={isCurrent}
          />
        )}
      </Form.ControlledField>
      <CheckboxField name="isRemote" form={props.form} label="Remote" />
      <CheckboxField name="visible" form={props.form} label="Visible" />
    </Form>
  );
};

export default ExperienceForm;
