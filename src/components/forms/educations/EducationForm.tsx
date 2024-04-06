"use client";
import { useState, useCallback, useEffect } from "react";

import { useWatch } from "react-hook-form";
import { type z } from "zod";

import { EducationSchema } from "~/api/schemas";
import { Checkbox } from "~/components/input/Checkbox";
import { DateSelect } from "~/components/input/dates/DateSelect";
import { ClientSchoolSelect } from "~/components/input/select/ClientSchoolSelect";
import { DegreeSelect } from "~/components/input/select/DegreeSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { Form, type FormProps } from "../generic/Form";

export const EducationFormSchema = EducationSchema.required();

export type EducationFormValues = z.infer<typeof EducationFormSchema>;

export interface EducationFormProps
  extends Omit<FormProps<EducationFormValues>, "children" | "onSubmit" | "contentClassName"> {}

export const EducationForm = (props: EducationFormProps): JSX.Element => {
  const postPoned = useWatch({ control: props.form.control, name: "postPoned" });
  const endDate = useWatch({ control: props.form.control, name: "endDate" });

  const [isCurrent, _setIsCurrent] = useState(endDate === null && !postPoned);
  const [endDateIsDisabled, setEndDateIsDisabled] = useState(isCurrent || postPoned);

  const setIsCurrent = useCallback((value: boolean) => {
    if (value === true) {
      setEndDateIsDisabled(true);
    } else {
      setEndDateIsDisabled(false);
    }
    _setIsCurrent(value);
  }, []);

  useEffect(() => {
    setIsCurrent(endDate === null && !postPoned);
  }, [endDate, postPoned, setIsCurrent]);

  return (
    <Form
      {...props}
      contentClassName="gap-[12px]"
      action={(data, form) => {
        if (isCurrent || postPoned) {
          props.action?.({ ...data, endDate: null }, form);
        } else {
          props.action?.(data, form);
        }
      }}
    >
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
      <Form.Field name="major" label="Major" form={props.form} condition="required">
        <TextInput className="w-full" {...props.form.register("major")} />
      </Form.Field>
      <Form.Field
        name="shortMajor"
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
        <TextArea className="w-full" {...props.form.register("description")} rows={4} />
      </Form.Field>
      <Form.ControlledField name="startDate" label="Start Date" form={props.form}>
        {({ value, onChange }) => (
          <DateSelect inputClassName="w-full" value={value} onChange={onChange} />
        )}
      </Form.ControlledField>
      <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
        <Form.ControlledField name="postPoned" form={props.form} className="max-w-fit">
          {({ value, onChange }) => (
            <div className="flex flex-row gap-[6px] items-center">
              <Checkbox
                value={value}
                onChange={e => {
                  _setIsCurrent(false);
                  if (!e.target.checked) {
                    setEndDateIsDisabled(false);
                  }
                  onChange(e);
                }}
              />
              <Label size="sm" fontWeight="medium" className="leading-[16px]">
                Post Poned
              </Label>
            </div>
          )}
        </Form.ControlledField>
        <div className="flex flex-row gap-[6px] items-center">
          <Checkbox
            value={isCurrent}
            onChange={e => {
              if (e.target.checked) {
                props.form.setValue("postPoned", false);
                setIsCurrent(true);
              } else {
                setIsCurrent(false);
              }
            }}
          />
          <Label size="sm" fontWeight="medium" className="leading-[16px]">
            Current
          </Label>
        </div>
      </div>
      <Form.ControlledField name="endDate" label="End Date" form={props.form}>
        {({ value, onChange }) => (
          <DateSelect
            inputClassName="w-full"
            value={value}
            onChange={onChange}
            isDisabled={endDateIsDisabled || postPoned}
          />
        )}
      </Form.ControlledField>
      <Form.Field name="note" label="Note" form={props.form}>
        <TextArea className="w-full" {...props.form.register("note")} />
      </Form.Field>
    </Form>
  );
};

export default EducationForm;
