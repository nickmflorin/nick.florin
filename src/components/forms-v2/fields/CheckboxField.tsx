import { type JSX } from 'react';

import { Checkbox, type CheckboxProps } from '~/components/input/Checkbox';

import { type BaseFormValues, type FieldName, type FormInstance } from '..';
import { Form } from '../Form';

export interface CheckboxFieldProps<I extends BaseFormValues> {
  readonly form: FormInstance<I>;
  readonly label: string;
  readonly name: FieldName<I>;
  readonly onChange?: CheckboxProps['onChange'];
}

export const CheckboxField = <I extends BaseFormValues>({
  form,
  label,
  name,
  onChange: _onChange,
}: CheckboxFieldProps<I>): JSX.Element => (
  <Form.ControlledField className='max-w-fit' form={form} name={name}>
    {({ onChange, value }) => (
      <Checkbox
        isChecked={value}
        label={label}
        onChange={e => {
          _onChange?.(e);
          onChange(e);
        }}
      />
    )}
  </Form.ControlledField>
);
