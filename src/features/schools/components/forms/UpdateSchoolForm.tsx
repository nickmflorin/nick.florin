'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type School } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateSchool } from '~/actions/schools/update-school';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { SchoolForm, type SchoolFormProps } from './SchoolForm';

export interface UpdateSchoolFormProps extends Omit<SchoolFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly school: School;
}

export const UpdateSchoolForm = ({
  onCancel,
  onSuccess,
  school,
  ...props
}: UpdateSchoolFormProps): JSX.Element => {
  const updateSchoolWithId = updateSchool.bind(null, school.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different school is being edited.  Keying the effect on
     the identifier rather than the school itself means a background revalidation of the same
     school never discards values the user is in the middle of editing. */
  const setSchoolFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...school,
      description: school.description ?? '',
      logoImageUrl: school.logoImageUrl ?? '',
      shortName: school.shortName ?? '',
      websiteUrl: school.websiteUrl ?? '',
    });
  });

  useEffect(() => {
    setSchoolFormValues();
  }, [school.id]);

  return (
    <SchoolForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateSchoolWithId>> | null = null;
        try {
          response = await updateSchoolWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the school with ID '${school.id}'.`, {
            data,
            school,
          });
          return toast.error('There was an error updating the school.');
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
