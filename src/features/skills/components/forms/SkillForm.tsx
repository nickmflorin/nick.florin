'use client';
import { type JSX, useEffect } from 'react';

import { useWatch } from 'react-hook-form';
import { type z } from 'zod';

import { slugify } from '~/lib/formatters';

import { SkillSchema } from '~/actions/schemas';

import { Checkboxes } from '~/components/forms-v2/fields/Checkboxes';
import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { ClientCourseSelect } from '~/features/courses/components/input/ClientCourseSelect';
import { ClientEducationSelect } from '~/features/educations/components/input/ClientEducationSelect';
import { ClientExperienceSelect } from '~/features/experiences/components/input/ClientExperienceSelect';
import { ClientProjectSelect } from '~/features/projects/components/input/ClientProjectSelect';
import { ClientRepositorySelect } from '~/features/repositories/components/input/ClientRepositorySelect';
import { ProgrammingDomainSelect } from '~/features/skills/components/input/ProgrammingDomainSelect';
import { ProgrammingLanguageSelect } from '~/features/skills/components/input/ProgrammingLanguageSelect';
import { SkillCategorySelect } from '~/features/skills/components/input/SkillCategorySelect';

export const SkillFormSchema = SkillSchema.required();

export type SkillFormValues = z.infer<typeof SkillFormSchema>;

export interface SkillFormProps extends Omit<
  FormProps<SkillFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const SkillForm = (props: SkillFormProps): JSX.Element => {
  const _labelValue = useWatch({ control: props.form.control, name: 'label' });

  useEffect(() => {
    props.form.setValue('slug', slugify(_labelValue));
  }, [_labelValue, props.form]);

  return (
    <Form {...props} contentClassName='gap-[12px]'>
      <Form.Field condition='required' form={props.form} label='Label' name='label'>
        <TextInput className='w-full' {...props.form.register('label')} />
      </Form.Field>
      <Form.Field
        form={props.form}
        helpText='If left blank, the slug will be automatically generated based on the label.'
        label='Slug'
        name='slug'
      >
        <TextInput className='w-full' {...props.form.register('slug')} />
      </Form.Field>
      <Form.Field form={props.form} label='Description' name='description'>
        <TextArea className='w-full' {...props.form.register('description')} rows={4} />
      </Form.Field>
      <Form.Field
        form={props.form}
        helpText='If left blank, the experience will be automatically calculated.'
        label='Experience'
        name='experience'
      >
        <TextInput className='w-full' {...props.form.register('experience')} />
      </Form.Field>
      <Form.ControlledField form={props.form} label='Experiences' name='experiences'>
        {({ onChange, value }) => (
          <ClientExperienceSelect
            behavior='multi'
            includes={[]}
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() =>
              props.form.setErrors('educations', 'There was an error loading the data.')
            }
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Educations' name='educations'>
        {({ onChange, value }) => (
          <ClientEducationSelect
            behavior='multi'
            includes={[]}
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() =>
              props.form.setErrors('educations', 'There was an error loading the data.')
            }
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Projects' name='projects'>
        {({ onChange, value }) => (
          <ClientProjectSelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() => props.form.setErrors('projects', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Repositories' name='repositories'>
        {({ onChange, value }) => (
          <ClientRepositorySelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() =>
              props.form.setErrors('repositories', 'There was an error loading the data.')
            }
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Courses' name='courses'>
        {({ onChange, value }) => (
          <ClientCourseSelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() => props.form.setErrors('courses', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Checkboxes className='mt-[8px] mb-[8px]'>
        <CheckboxField form={props.form} label='Visible' name='visible' />
        <CheckboxField form={props.form} label='Top Skill' name='highlighted' />
        <CheckboxField form={props.form} label='Prioritized' name='prioritized' />
      </Checkboxes>
      <Form.ControlledField form={props.form} label='Domains' name='programmingDomains'>
        {({ onChange, value }) => (
          <ProgrammingDomainSelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            onChange={onChange}
            popoverPlacement='top'
            value={value}
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Languages' name='programmingLanguages'>
        {({ onChange, value }) => (
          <ProgrammingLanguageSelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            onChange={onChange}
            popoverPlacement='top'
            value={value}
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField form={props.form} label='Categories' name='categories'>
        {({ onChange, value }) => (
          <SkillCategorySelect
            behavior='multi'
            inputClassName='w-full'
            isClearable
            onChange={onChange}
            popoverPlacement='top'
            value={value}
          />
        )}
      </Form.ControlledField>
    </Form>
  );
};
