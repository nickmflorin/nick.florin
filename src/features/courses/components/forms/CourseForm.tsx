import { type JSX } from 'react';

import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { TextInput } from '~/components/input/TextInput';
import { ClientEducationSelect } from '~/features/educations/components/input/ClientEducationSelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { type CourseFormValues } from './schema';

export interface CourseFormProps extends Omit<
  FormProps<CourseFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const CourseForm = (props: CourseFormProps): JSX.Element => (
  <Form {...props} contentClassName='gap-[12px]'>
    <Form.Field form={props.form} label='Name' name='name'>
      <TextInput className='w-full' {...props.form.register('name')} />
    </Form.Field>
    <Form.Field form={props.form} label='Name (Abbv.)' name='shortName'>
      <TextInput className='w-full' {...props.form.register('shortName')} />
    </Form.Field>
    <Form.Field
      form={props.form}
      helpText='If not provided, will be auto generated based on the name.'
      label='Slug'
      name='slug'
    >
      <TextInput className='w-full' {...props.form.register('slug')} />
    </Form.Field>
    <Form.ControlledField
      form={props.form}
      helpText='The educational experience in which the course was taken.'
      label='Education'
      labelProps={{ fontSize: 'xs' }}
      name='education'
    >
      {({ onChange, value }) => (
        <ClientEducationSelect
          behavior='single'
          hasAbbreviatedLabels={false}
          includes={[]}
          inputClassName='w-full'
          isInPortal
          onChange={onChange}
          onError={() => props.form.setErrors('education', 'There was an error loading the data.')}
          /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The schema
             types the value as non-nullable, but the form provides it as undefined until set. */
          value={value ?? null}
          visibility='admin'
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField form={props.form} label='Skills' name='skills'>
      {({ onChange, value }) => (
        <ClientSkillsSelect
          behavior='multi'
          inputClassName='w-full'
          onChange={onChange}
          value={value}
          visibility='admin'
        />
      )}
    </Form.ControlledField>
    <CheckboxField form={props.form} label='Visible' name='visible' />
  </Form>
);
