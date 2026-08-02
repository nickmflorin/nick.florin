import { useRouter } from 'next/navigation';
import { type JSX, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiDetail, type ApiNestedDetail } from '~/database/model';
import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';

import { Link } from '~/components/buttons';
import { FormFieldErrors } from '~/components/forms-v2/Field/FieldErrors';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { useForm } from '~/components/forms-v2/hooks/use-form';
import { TextInput } from '~/components/input/TextInput';

import { DetailFormSchema, type DetailFormValues } from '../types';

export interface GenericCreateDetailFormProps<
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
> extends Omit<
  FormProps<Pick<DetailFormValues, 'label'>>,
  'action' | 'children' | 'contentClassName' | 'form'
> {
  readonly action: (
    data: { readonly visible: boolean } & Pick<DetailFormValues, 'label'>,
  ) => Promise<MutationActionResponse<D>>;
  readonly onCancel: () => void;
  readonly onCreated: (detail: D) => void;
}

export const GenericCreateDetailForm = <
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
>({
  action,
  onCancel,
  onCreated,
  ...props
}: GenericCreateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const form = useForm<Pick<DetailFormValues, 'label'>>({
    defaultValues: {
      label: '',
    },
    schema: DetailFormSchema.pick({ label: true }),
  });

  return (
    <Form
      {...props}
      action={async (data, formInstance) => {
        setIsCreating(true);
        let response: MutationActionResponse<D> | null = null;
        try {
          response = await action({ ...data, visible: true });
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the detail'.", {
            data,
          });
          setIsCreating(false);
          return toast.error('There was an error creating the detail.');
        }
        const { data: detail, error } = response;
        if (error) {
          setIsCreating(false);
          return formInstance.handleApiError(error);
        }
        formInstance.reset();
        transition(() => {
          router.refresh();
          setIsCreating(false);
          onCreated(detail);
        });
      }}
      contentClassName='gap-[12px]'
      form={form}
      structure={({ footer }) => (
        <div className='flex flex-col'>
          <div className='flex flex-row justify-between items-center'>
            <Form.Field autoRenderErrors={false} className='mr-[12px]' form={form} name='label'>
              <TextInput
                className='w-full p-0 outline-none'
                {...form.register('label')}
                fontWeight='medium'
                placeholder='Label'
                size='small'
              />
            </Form.Field>
            <div className='flex flex-row gap-[6px] items-center'>
              <Link.Secondary
                element='button'
                fontSize='xs'
                fontWeight='regular'
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                Cancel
              </Link.Secondary>
              <Link.Primary
                element='button'
                fontSize='xs'
                fontWeight='regular'
                isLoading={isCreating}
                loadingLocation='over'
                type='submit'
              >
                Create
              </Link.Primary>
            </div>
          </div>
          <FormFieldErrors form={form} name='label' />
          <div className='flex flex-col mt-[4px]'>{footer}</div>
        </div>
      )}
    />
  );
};
