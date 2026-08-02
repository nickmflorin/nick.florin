'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Skill } from '~/database/model';
import { logger } from '~/internal/logger';

import { createSkill } from '~/actions/skills/create-skill';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { SkillForm, type SkillFormProps } from './SkillForm';

export interface CreateSkillFormProps extends Omit<SkillFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Skill) => void;
}

export const CreateSkillForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateSkillFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <SkillForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createSkill>> | null = null;
        try {
          response = await createSkill(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the skill'.", {
            data,
          });
          return toast.error('There was an error creating the skill.');
        }
        const { data: skill, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(skill);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
