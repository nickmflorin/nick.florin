'use client';
import { type JSX, useState } from 'react';

import { useWatch } from 'react-hook-form';

import { Checkboxes } from '~/components/forms-v2/fields/Checkboxes';
import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { Checkbox } from '~/components/input/Checkbox';
import { DateSelect } from '~/components/input/dates/DateSelect';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { DegreeSelect } from '~/features/educations/components/input/DegreeSelect';
import { ClientSchoolSelect } from '~/features/schools/components/input/ClientSchoolSelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { type EducationFormValues } from './schema';

export interface EducationFormProps extends Omit<
  FormProps<EducationFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

/**
 * An explicit choice made with the 'Current' checkbox, together with the form values that the
 * checkbox would otherwise be derived from at the time the choice was made.
 *
 * An education is current when it has no end date and has not been postponed, so the checkbox is
 * derived from those two values rather than stored.  The user can still toggle the checkbox
 * directly, and that choice has to survive until one of the two values it contradicts changes,
 * which is what the recorded {@link CurrentOverride.key} is compared against.
 */
interface CurrentOverride {
  readonly isCurrent: boolean;
  readonly key: string;
}

const getCurrentOverrideKey = (endDate: Date | null, postPoned: boolean): string =>
  `${endDate === null ? '' : endDate.toISOString()}|${postPoned}`;

export const EducationForm = (props: EducationFormProps): JSX.Element => {
  const postPoned = useWatch({ control: props.form.control, name: 'postPoned' });
  const endDate = useWatch({ control: props.form.control, name: 'endDate' });

  const [currentOverride, setCurrentOverride] = useState<CurrentOverride | null>(null);

  const overrideKey = getCurrentOverrideKey(endDate, postPoned);
  const isCurrent =
    currentOverride?.key === overrideKey
      ? currentOverride.isCurrent
      : endDate === null && !postPoned;

  const updateIsCurrent = (value: boolean) =>
    setCurrentOverride({ isCurrent: value, key: overrideKey });

  return (
    <Form
      {...props}
      action={(data, form) => {
        if (isCurrent || postPoned) {
          props.action?.({ ...data, endDate: null }, form);
        } else {
          props.action?.(data, form);
        }
      }}
      contentClassName='gap-[12px]'
    >
      <Form.ControlledField condition='required' form={props.form} label='School' name='school'>
        {({ onChange, value }) => (
          <ClientSchoolSelect
            behavior='single'
            inputClassName='w-full'
            isInPortal
            /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The schema
               types the value as non-nullable, but the form provides it as undefined until set. */
            isReady={value !== undefined}
            onChange={onChange}
            onError={() => props.form.setErrors('school', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.Field condition='required' form={props.form} label='Major' name='major'>
        <TextInput className='w-full' {...props.form.register('major')} />
      </Form.Field>
      <Form.Field
        form={props.form}
        helpText={
          'An abbreviated version of the major.  This is used for data ' +
          'entry components in the admin.'
        }
        label='Short Major'
        name='shortMajor'
      >
        <TextInput className='w-full' {...props.form.register('shortMajor')} />
      </Form.Field>
      <Form.ControlledField form={props.form} label='Degree' name='degree'>
        {({ onChange, value }) => (
          <DegreeSelect
            behavior='single'
            inputClassName='w-full'
            onChange={onChange}
            value={value}
          />
        )}
      </Form.ControlledField>
      <Form.Field form={props.form} label='Minor' name='minor'>
        <TextInput className='w-full' {...props.form.register('minor')} />
      </Form.Field>
      <Form.Field form={props.form} label='Concentration' name='concentration'>
        <TextInput className='w-full' {...props.form.register('concentration')} />
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
      <div className='flex flex-row gap-[12px] items-center mt-[8px] mb-[8px]'>
        <CheckboxField form={props.form} label='Postponed' name='postPoned' />
        <Checkbox
          isChecked={isCurrent}
          label='Current'
          onChange={e => {
            if (e.target.checked) {
              props.form.setValue('postPoned', false);
              updateIsCurrent(true);
            } else {
              updateIsCurrent(false);
            }
          }}
        />
      </div>
      <Form.ControlledField form={props.form} label='End Date' name='endDate'>
        {({ onChange, value }) => (
          <DateSelect
            inputClassName='w-full'
            isDisabled={isCurrent || postPoned}
            onChange={onChange}
            value={value}
          />
        )}
      </Form.ControlledField>
      <Form.Field form={props.form} label='Note' name='note'>
        <TextArea className='w-full' {...props.form.register('note')} />
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
};
