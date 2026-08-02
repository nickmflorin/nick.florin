'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiExperience } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateExperience } from '~/actions/experiences/update-experience';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { ExperienceForm, type ExperienceFormProps } from './ExperienceForm';

export interface UpdateExperienceFormProps extends Omit<ExperienceFormProps, 'action'> {
  readonly experience: ApiExperience<['skills']>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateExperienceForm = ({
  experience,
  onCancel,
  onSuccess,
  ...props
}: UpdateExperienceFormProps): JSX.Element => {
  const updateExperienceWithId = updateExperience.bind(null, experience.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different experience is being edited.  Keying the effect on
     the identifier rather than the experience itself means a background revalidation of the same
     experience never discards values the user is in the middle of editing. */
  const setExperienceFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...experience,
      company: experience.companyId,
      description: experience.description ?? '',
      skills: experience.skills.map(s => s.id),
    });
  });

  useEffect(() => {
    setExperienceFormValues();
  }, [experience.id]);

  return (
    <ExperienceForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateExperienceWithId>> | null = null;
        try {
          response = await updateExperienceWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the experience with ID '${experience.id}'.`,
            { data, experience },
          );
          return toast.error('There was an error updating the experience.');
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
