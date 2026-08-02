'use client';
import { type JSX, useEffect, useState } from 'react';

import { useWatch } from 'react-hook-form';

import { Checkboxes } from '~/components/forms-v2/fields/Checkboxes';
import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { Checkbox } from '~/components/input/Checkbox';
import { DateSelect } from '~/components/input/dates/DateSelect';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { Label } from '~/components/typography';
import { ClientCompanySelect } from '~/features/companies/components/input/ClientCompanySelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { type ExperienceFormValues } from './schema';

export interface ExperienceFormProps extends Omit<
  FormProps<ExperienceFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const ExperienceForm = (props: ExperienceFormProps): JSX.Element => {
  const endDate = useWatch({ control: props.form.control, name: 'endDate' });

  const [isCurrent, setIsCurrent] = useState(endDate === null);

  useEffect(() => {
    setIsCurrent(endDate === null);
  }, [endDate]);

  return (
    <Form
      {...props}
      action={(data, form) => {
        if (isCurrent) {
          props.action?.({ ...data, endDate: null }, form);
        } else {
          props.action?.(data, form);
        }
      }}
      contentClassName='gap-[12px]'
    >
      <Form.ControlledField condition='required' form={props.form} label='Company' name='company'>
        {({ onChange, value }) => (
          <ClientCompanySelect
            behavior='single'
            inputClassName='w-full'
            isInPortal
            /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The schema
               types the value as non-nullable, but the form provides it as undefined until set. */
            isReady={value !== undefined}
            onChange={onChange}
            onError={() => props.form.setErrors('company', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.Field condition='required' form={props.form} label='Title' name='title'>
        <TextInput className='w-full' {...props.form.register('title')} />
      </Form.Field>
      <Form.Field
        form={props.form}
        helpText={
          'An abbreviated version of the title.  This is used for data ' +
          'entry components in the admin.'
        }
        label='Short Title'
        name='shortTitle'
      >
        <TextInput className='w-full' {...props.form.register('shortTitle')} />
      </Form.Field>
      <Form.Field form={props.form} label='Description' name='description'>
        <TextArea className='w-full' {...props.form.register('description')} rows={4} />
      </Form.Field>
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
      <div className='flex flex-row gap-[6px] items-center mt-[8px] mb-[8px]'>
        <Checkbox isChecked={isCurrent} onChange={e => setIsCurrent(e.target.checked)} />
        <Label className='leading-[16px]' fontSize='sm' fontWeight='medium'>
          Current
        </Label>
      </div>
      <Form.ControlledField form={props.form} label='End Date' name='endDate'>
        {({ onChange, value }) => (
          <DateSelect
            inputClassName='w-full'
            isDisabled={isCurrent}
            onChange={onChange}
            value={value}
          />
        )}
      </Form.ControlledField>
      <Checkboxes hasOuterMargin orientation='horizontal'>
        <CheckboxField form={props.form} label='Current' name='isCurrent' />
        <CheckboxField form={props.form} label='Remote' name='isRemote' />
      </Checkboxes>
      <Checkboxes hasOuterMargin orientation='horizontal'>
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
};
