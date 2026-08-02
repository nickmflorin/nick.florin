'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiEducation } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateEducation } from '~/actions/educations/update-education';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { EducationForm, type EducationFormProps } from './EducationForm';

export interface UpdateEducationFormProps extends Omit<EducationFormProps, 'action'> {
  readonly education: ApiEducation<['skills']>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateEducationForm = ({
  education,
  onCancel,
  onSuccess,
  ...props
}: UpdateEducationFormProps): JSX.Element => {
  const updateEducationWithId = updateEducation.bind(null, education.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different education is being edited.  Keying the effect on
     the identifier rather than the education itself means a background revalidation of the same
     education never discards values the user is in the middle of editing. */
  const setEducationFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...education,
      concentration: education.concentration ?? '',
      description: education.description ?? '',
      minor: education.minor ?? '',
      note: education.note ?? '',
      school: education.schoolId,
      skills: education.skills.map(s => s.id),
    });
  });

  useEffect(() => {
    setEducationFormValues();
  }, [education.id]);

  return (
    <EducationForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateEducationWithId>> | null = null;
        try {
          response = await updateEducationWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the education with ID '${education.id}'.`,
            { data, education },
          );
          return toast.error('There was an error updating the education.');
        }
        const { error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.();
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
