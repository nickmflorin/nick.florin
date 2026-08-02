import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useMemo, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiDetail, type ApiNestedDetail, isNestedDetail } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateDetail } from '~/actions/details/update-detail';
import { updateNestedDetail } from '~/actions/details/update-nested-detail';

import { IconButton } from '~/components/buttons';
import { FormFieldErrors } from '~/components/forms-v2/Field/FieldErrors';
import { CheckboxField } from '~/components/forms-v2/fields/CheckboxField';
import { Form, type FormProps } from '~/components/forms-v2/Form';
import { useForm } from '~/components/forms-v2/hooks';
import { CaretIcon } from '~/components/icons/CaretIcon';
import { TextArea } from '~/components/input/TextArea';
import { TextInput } from '~/components/input/TextInput';
import { type Action, Actions } from '~/components/structural/Actions';
import { ButtonFooter } from '~/components/structural/ButtonFooter';
import { classNames } from '~/components/types';
import { ShowHide } from '~/components/util';
import { ClientProjectSelect } from '~/features/projects/components/input/ClientProjectSelect';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

import { DetailFormSchema, type DetailFormValues } from '../types';

export interface GenericUpdateDetailFormProps<
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
> extends Omit<FormProps<DetailFormValues>, 'action' | 'children' | 'contentClassName' | 'form'> {
  readonly actions?: Action[];
  readonly detail: D;
  readonly isExpanded: boolean;
  readonly onSuccess?: () => void;
}

/**
 * The initial number of rows for a text area that uses `autoSize`, so that it starts as a single
 * row and only grows to fit content that spans multiple rows.
 */
const AutoSizingTextAreaInitialRows = 1;

export const GenericUpdateDetailForm = <
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
>({
  actions,
  detail,
  isExpanded,
  onSuccess,
  ...props
}: GenericUpdateDetailFormProps<D>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const [_, transition] = useTransition();
  const router = useRouter();

  const updateDetailWithId = useMemo(
    () =>
      isNestedDetail(detail)
        ? updateNestedDetail.bind(null, detail.id)
        : updateDetail.bind(null, detail.id),
    [detail],
  );

  const { setValues, ...form } = useForm<DetailFormValues>({
    defaultValues: {
      description: '',
      label: '',
      project: null,
      shortDescription: '',
      skills: [],
      visible: true,
    },
    schema: DetailFormSchema,
  });

  useEffect(() => {
    setValues({
      description: detail.description ?? '',
      label: detail.label,
      project: detail.project?.id ?? null,
      shortDescription: detail.shortDescription ?? '',
      skills: detail.skills.map(sk => sk.id),
      visible: detail.visible,
    });
  }, [detail, setValues]);

  return (
    <Form<DetailFormValues>
      {...props}
      action={async (data, submittedForm) => {
        let response: Awaited<ReturnType<typeof updateDetailWithId>> | null = null;
        try {
          response = await updateDetailWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the detail with ID '${detail.id}'.`, {
            data,
            detail,
          });
          return toast.error('There was an error updating the detail.');
        }
        const { error } = response;
        if (error) {
          return submittedForm.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.();
        });
      }}
      contentClassName='gap-[12px]'
      footer={<ButtonFooter buttonSize='xsmall' submitText='Save' />}
      form={{ setValues, ...form }}
      structure={
        isExpanded
          ? ({ body, footer }) => (
              <>
                {body}
                {footer}
              </>
            )
          : ({ body, footer }) => (
              <div className='flex flex-col'>
                <div className='flex flex-row justify-between items-center'>
                  <Form.Field
                    autoRenderErrors={false}
                    className='mr-[12px]'
                    form={{ ...form, setValues }}
                    name='label'
                  >
                    <TextInput
                      className='w-full p-0 outline-none'
                      {...form.register('label')}
                      fontWeight='medium'
                      isReadOnly={!isOpen}
                      placeholder='Label'
                      size='small'
                    />
                  </Form.Field>
                  <div className='flex flex-row gap-[6px] items-center'>
                    <Actions actions={actions ?? []} />
                    <IconButton.Transparent
                      key={actions ? actions.length : '0'}
                      onClick={() => setIsOpen(curr => !curr)}
                      size='xsmall'
                    >
                      <CaretIcon isOpen={isOpen} />
                    </IconButton.Transparent>
                  </div>
                </div>
                <ShowHide show={isOpen === true}>
                  <FormFieldErrors form={{ ...form, setValues }} name='label' />
                  <div className='flex flex-col mt-[4px]'>
                    {body}
                    {footer}
                  </div>
                </ShowHide>
              </div>
            )
      }
    >
      <ShowHide show={isExpanded}>
        <Form.Field
          autoRenderErrors={false}
          form={{ ...form, setValues }}
          label='Label'
          labelProps={{ fontSize: 'xs' }}
          name='label'
        >
          <TextInput
            className={classNames('w-full', { 'p-0 outline-none': !isExpanded })}
            {...form.register('label')}
            fontWeight={isExpanded ? 'regular' : 'medium'}
            placeholder='Label'
            size='small'
          />
        </Form.Field>
      </ShowHide>
      <Form.Field
        form={{ ...form, setValues }}
        label='Description'
        labelProps={{ fontSize: 'xs' }}
        name='description'
      >
        <TextArea
          autoSize
          className={classNames('w-full', { 'p-0 outline-none': !isExpanded })}
          {...form.register('description')}
          placeholder={
            'A brief description of the detail that will appear on the ' + 'online portfolio.'
          }
          size='small'
        />
      </Form.Field>
      <Form.Field
        form={{ ...form, setValues }}
        label='Short Description'
        labelProps={{ fontSize: 'xs' }}
        name='shortDescription'
      >
        <TextArea
          autoSize
          className={classNames('w-full', { 'p-0 outline-none': !isExpanded })}
          {...form.register('shortDescription')}
          placeholder='A shortened version of the description.'
          rows={AutoSizingTextAreaInitialRows}
          size='small'
        />
      </Form.Field>
      <Form.ControlledField
        form={{ ...form, setValues }}
        helpText='Any skills that the detail is associated with, if applicable.'
        label='Skills'
        labelProps={{ fontSize: 'xs' }}
        name='skills'
      >
        {({ onChange, value }) => (
          <ClientSkillsSelect
            behavior='multi'
            inputClassName='w-full'
            isInPortal
            onChange={onChange}
            onError={() => form.setErrors('skills', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField
        form={{ ...form, setValues }}
        helpText='The project that the detail is associated with, if applicable.'
        label='Project'
        labelProps={{ fontSize: 'xs' }}
        name='project'
      >
        {({ onChange, value }) => (
          <ClientProjectSelect
            behavior='single-nullable'
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() => form.setErrors('project', 'There was an error loading the data.')}
            value={value}
            visibility='admin'
          />
        )}
      </Form.ControlledField>
      <ShowHide show={isExpanded}>
        <CheckboxField form={{ ...form, setValues }} label='Visible' name='visible' />
      </ShowHide>
    </Form>
  );
};
