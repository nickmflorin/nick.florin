'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiSkill } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateSkill } from '~/actions/skills/update-skill';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { SkillForm, type SkillFormProps } from './SkillForm';

export interface UpdateSkillFormProps extends Omit<SkillFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly skill: ApiSkill<['educations', 'experiences', 'projects', 'repositories', 'courses']>;
}

export const UpdateSkillForm = ({
  onCancel,
  onSuccess,
  skill,
  ...props
}: UpdateSkillFormProps): JSX.Element => {
  const updateSkillWithId = updateSkill.bind(null, skill.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different skill is being edited.  Keying the effect on
     the identifier rather than the skill itself means a background revalidation of the same
     skill never discards values the user is in the middle of editing. */
  const setSkillFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...skill,
      courses: skill.courses.map(course => course.id),
      description: skill.description ?? '',
      educations: skill.educations.map(edu => edu.id),
      experiences: skill.experiences.map(exp => exp.id),
      projects: skill.projects.map(proj => proj.id),
      repositories: skill.repositories.map(repo => repo.id),
    });
  });

  useEffect(() => {
    setSkillFormValues();
  }, [skill.id]);

  return (
    <SkillForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateSkillWithId>> | null = null;
        try {
          response = await updateSkillWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the skill with ID '${skill.id}'.`, {
            data,
            skill,
          });
          return toast.error('There was an error updating the skill.');
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
