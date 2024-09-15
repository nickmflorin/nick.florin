import { Form } from "~/components/forms/Form";
import { Checkbox, type CheckboxProps } from "~/components/input/Checkbox";

import { type FieldName, type BaseFormValues, type FormInstance } from "../types";

export interface CheckboxFieldProps<I extends BaseFormValues> {
  readonly form: FormInstance<I>;
  readonly name: FieldName<I>;
  readonly label: string;
  readonly onChange?: CheckboxProps["onChange"];
}

export const CheckboxField = <I extends BaseFormValues>({
  form,
  name,
  label,
  onChange: _onChange,
}: CheckboxFieldProps<I>): JSX.Element => (
  <Form.ControlledField name={name} form={form} className="max-w-fit">
    {({ value, onChange }) => (
      <Checkbox
        value={value}
        onChange={e => {
          _onChange?.(e);
          onChange(e);
        }}
        label={label}
      />
    )}
  </Form.ControlledField>
);
