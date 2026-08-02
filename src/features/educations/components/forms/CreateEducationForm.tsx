'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Education } from '~/database/model';
import { logger } from '~/internal/logger';

import { createEducation } from '~/actions/educations/create-education';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { EducationForm, type EducationFormProps } from './EducationForm';

export interface CreateEducationFormProps extends Omit<EducationFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Education) => void;
}

export const CreateEducationForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateEducationFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <EducationForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createEducation>> | null = null;
        try {
          response = await createEducation(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the education'.", {
            data,
          });
          return toast.error('There was an error creating the education.');
        }
        const { data: education, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(education);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
