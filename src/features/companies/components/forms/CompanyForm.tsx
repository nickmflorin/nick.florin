import { type JSX } from 'react';

import { Form, type FormProps } from '~/components/forms-v2/Form';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';

import { type CompanyFormValues } from './schema';

export interface CompanyFormProps extends Omit<
  FormProps<CompanyFormValues>,
  'children' | 'contentClassName' | 'onSubmit'
> {}

export const CompanyForm = (props: CompanyFormProps): JSX.Element => (
  <Form {...props} contentClassName='gap-[12px]'>
    <Form.Field form={props.form} label='Name' name='name'>
      <TextInput className='w-full' {...props.form.register('name')} />
    </Form.Field>
    <Form.Field form={props.form} label='Name (Abbv.)' name='shortName'>
      <TextInput className='w-full' {...props.form.register('shortName')} />
    </Form.Field>
    <Form.Field form={props.form} label='Description' name='description'>
      <TextArea className='w-full' {...props.form.register('description')} rows={4} />
    </Form.Field>
    <Form.Field form={props.form} label='Logo URL' name='logoImageUrl'>
      <TextInput className='w-full' {...props.form.register('logoImageUrl')} />
    </Form.Field>
    <Form.Field form={props.form} label='Website URL' name='websiteUrl'>
      <TextInput className='w-full' {...props.form.register('websiteUrl')} />
    </Form.Field>
    <Form.Field form={props.form} label='City' name='city'>
      <TextInput className='w-full' {...props.form.register('city')} />
    </Form.Field>
    <Form.Field form={props.form} label='State' name='state'>
      <TextInput className='w-full' {...props.form.register('state')} />
    </Form.Field>
  </Form>
);
