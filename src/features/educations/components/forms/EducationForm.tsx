"use client";
import { useState, useCallback, useEffect } from "react";

import { useWatch } from "react-hook-form";

import { Checkboxes } from "~/components/forms/fields/Checkboxes";
import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { Form, type FormProps } from "~/components/forms/Form";
import { Checkbox } from "~/components/input/Checkbox";
import { DateSelect } from "~/components/input/dates/DateSelect";
import { ClientSchoolSelect } from "~/components/input/select/ClientSchoolSelect";
import { DegreeSelect } from "~/components/input/select/DegreeSelect";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { type EducationFormValues } from "./schema";

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
            options={{ isMulti: false, isClearable: true }}
            value={value}
            onChange={onChange}
            inPortal
            onError={() => props.form.setErrors("school", "There was an error loading the data.")}
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
            options={{ isMulti: false, isClearable: true }}
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
      <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
        <CheckboxField
          name="postPoned"
          label="Post Poned"
          form={props.form}
          onChange={e => {
            _setIsCurrent(false);
            if (!e.target.checked) {
              setEndDateIsDisabled(false);
            }
          }}
        />
        <Checkbox
          value={isCurrent}
          label="Current"
          onChange={e => {
            if (e.target.checked) {
              props.form.setValue("postPoned", false);
              setIsCurrent(true);
            } else {
              setIsCurrent(false);
            }
          }}
        />
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
};

export default EducationForm;
