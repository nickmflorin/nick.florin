'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type School } from '~/database/model';
import { logger } from '~/internal/logger';

import { createSchool } from '~/actions/schools/create-school';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { SchoolForm, type SchoolFormProps } from './SchoolForm';

export interface CreateSchoolFormProps extends Omit<SchoolFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: School) => void;
}

export const CreateSchoolForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateSchoolFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <SchoolForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createSchool>> | null = null;
        try {
          response = await createSchool(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the school'.", {
            data,
          });
          return toast.error('There was an error creating the school.');
        }
        const { data: school, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          form.reset();
          router.refresh();
          onSuccess?.(school);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
