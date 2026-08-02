'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Experience } from '~/database/model';
import { logger } from '~/internal/logger';

import { createExperience } from '~/actions/experiences/create-experience';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { ExperienceForm, type ExperienceFormProps } from './ExperienceForm';

export interface CreateExperienceFormProps extends Omit<ExperienceFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Experience) => void;
}

export const CreateExperienceForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateExperienceFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <ExperienceForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createExperience>> | null = null;
        try {
          response = await createExperience(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the experience'.", {
            data,
          });
          return toast.error('There was an error creating the experience.');
        }
        const { data: experience, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(experience);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
