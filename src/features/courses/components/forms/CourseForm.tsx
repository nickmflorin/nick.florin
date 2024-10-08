import { CheckboxField } from "~/components/forms-v2/fields/CheckboxField";
import { Form, type FormProps } from "~/components/forms-v2/Form";
import { TextInput } from "~/components/input/TextInput";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

import { type CourseFormValues } from "./schema";

export interface CourseFormProps
  extends Omit<FormProps<CourseFormValues>, "children" | "onSubmit" | "contentClassName"> {}

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
      labelProps={{ fontSize: "xs" }}
      form={props.form}
      helpText="The educational experience in which the course was taken."
    >
      {({ value, onChange }) => (
        <ClientEducationSelect
          includes={[]}
          inputClassName="w-full"
          value={value ?? null}
          visibility="admin"
          behavior="single"
          useAbbreviatedLabels={false}
          onChange={onChange}
          inPortal
          onError={() => props.form.setErrors("education", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField name="skills" label="Skills" form={props.form}>
      {({ value, onChange }) => (
        <ClientSkillsSelect
          visibility="admin"
          behavior="multi"
          inputClassName="w-full"
          value={value}
          onChange={onChange}
        />
      )}
    </Form.ControlledField>
    <CheckboxField name="visible" form={props.form} label="Visible" />
  </Form>
);

export default CourseForm;
