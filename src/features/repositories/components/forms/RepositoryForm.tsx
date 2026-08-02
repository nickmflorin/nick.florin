'use client';
import { type JSX } from 'react';

import { Checkboxes } from '~/components/forms-v2/fields/Checkboxes';
import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { DateSelect } from '~/components/input/dates/DateSelect';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { ClientProjectSelect } from '~/features/projects/components/input/ClientProjectSelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { type RepositoryFormValues } from './schema';

export interface RepositoryFormProps extends Omit<
  FormProps<RepositoryFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const RepositoryForm = (props: RepositoryFormProps): JSX.Element => (
  <Form {...props} contentClassName='gap-[12px]'>
    <Form.Field
      form={props.form}
      helpText='This must match the slug in Github.'
      label='Slug'
      name='slug'
    >
      <TextInput className='w-full' {...props.form.register('slug')} />
    </Form.Field>
    <Form.Field form={props.form} label='Description' name='description'>
      <TextArea className='w-full' {...props.form.register('description')} rows={4} />
    </Form.Field>
    <Form.ControlledField form={props.form} label='Projects' name='projects'>
      {({ onChange, value }) => (
        <ClientProjectSelect
          behavior='multi'
          inputClassName='w-full'
          isClearable
          onChange={onChange}
          value={value}
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
    <Form.ControlledField form={props.form} label='Start Date' name='startDate'>
      {({ onChange, value }) => (
        <DateSelect inputClassName='w-full' onChange={onChange} value={value} />
      )}
    </Form.ControlledField>
    <Form.Field
      form={props.form}
      helpText='The name of the package on npm (if applicable).'
      label='NPM Package Name'
      name='npmPackageName'
    >
      <TextInput className='w-full' {...props.form.register('npmPackageName')} />
    </Form.Field>
    <Checkboxes hasOuterMargin>
      <CheckboxField
        form={props.form}
        label='Highlighted'
        name='highlighted'
        onChange={e => {
          if (e.target.checked) {
            props.form.setValue('visible', true);
          }
        }}
      />
      <CheckboxField
        form={props.form}
        label='Visible'
        name='visible'
        onChange={e => {
          if (!e.target.checked) {
            props.form.setValue('highlighted', false);
          }
        }}
      />
    </Checkboxes>
  </Form>
);
