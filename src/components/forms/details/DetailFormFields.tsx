import { Checkbox } from "~/components/input/Checkbox";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { Label } from "~/components/typography/Label";

import { Form, type FormProps } from "../Form";

import { type DetailsFormValues } from "./types";

export interface DetailFormFieldsProps extends Pick<FormProps<DetailsFormValues>, "form"> {
  readonly index: number;
}

export const DetailFormFields = ({ form, index }: DetailFormFieldsProps): JSX.Element => (
  <div className="flex flex-col gap-[12px]">
    <Form.Field name={`details.${index}.label`} label="Label" form={form} condition="required">
      <TextInput className="w-full" {...form.register(`details.${index}.label`)} />
    </Form.Field>
    <Form.Field name={`details.${index}.description`} label="Description" form={form}>
      <TextArea className="w-full" {...form.register(`details.${index}.description`)} rows={4} />
    </Form.Field>
    <Form.Field name={`details.${index}.shortDescription`} label="Short Description" form={form}>
      <TextArea
        className="w-full"
        {...form.register(`details.${index}.shortDescription`)}
        rows={4}
      />
    </Form.Field>
    <div className="flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]">
      <Form.ControlledField name={`details.${index}.visible`} form={form} className="max-w-fit">
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
  </div>
);
