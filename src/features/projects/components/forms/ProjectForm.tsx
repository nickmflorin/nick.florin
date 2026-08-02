'use client';
import { type JSX } from 'react';

import { Form, type FormProps } from '~/components/forms-v2/Form';
import { DateSelect } from '~/components/input/dates/DateSelect';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { ClientRepositorySelect } from '~/features/repositories/components/input/ClientRepositorySelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { type ProjectFormValues } from './schema';

export interface ProjectFormProps extends Omit<
  FormProps<ProjectFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const ProjectForm = (props: ProjectFormProps): JSX.Element => (
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
    <Form.Field form={props.form} label='Description' name='description'>
      <TextArea className='w-full' {...props.form.register('description')} rows={4} />
    </Form.Field>
    <Form.ControlledField
      form={props.form}
      helpText='Any repositories that are associated with the project.'
      label='Repositories'
      name='repositories'
    >
      {({ onChange, value }) => (
        <ClientRepositorySelect
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
    <Form.ControlledField
      form={props.form}
      helpText={
        'The date that the project started.  Used for determining the ' +
        'experience for skills associated with the project.'
      }
      label='Start Date'
      name='startDate'
    >
      {({ onChange, value }) => (
        <DateSelect inputClassName='w-full' isInPortal onChange={onChange} value={value} />
      )}
    </Form.ControlledField>
  </Form>
);
