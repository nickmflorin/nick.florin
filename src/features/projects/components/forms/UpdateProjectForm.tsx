'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiProject } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateProject } from '~/actions/projects/update-project';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { ProjectForm, type ProjectFormProps } from './ProjectForm';

export interface UpdateProjectFormProps extends Omit<ProjectFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly project: ApiProject<['skills', 'repositories', 'nestedDetails', 'details']>;
}

export const UpdateProjectForm = ({
  onCancel,
  onSuccess,
  project,
  ...props
}: UpdateProjectFormProps): JSX.Element => {
  const updateProjectWithId = updateProject.bind(null, project.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different project is being edited.  Keying the effect on
     the identifier rather than the project itself means a background revalidation of the same
     project never discards values the user is in the middle of editing. */
  const setProjectFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...project,
      details: project.details.map(d => d.id),
      nestedDetails: project.nestedDetails.map(d => d.id),
      repositories: project.repositories.map(r => r.id),
      shortName: project.shortName ?? '',
      skills: project.skills.map(sk => sk.id),
    });
  });

  useEffect(() => {
    setProjectFormValues();
  }, [project.id]);

  return (
    <ProjectForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateProjectWithId>> | null = null;
        try {
          response = await updateProjectWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the project with ID '${project.id}'.`,
            { data, project },
          );
          return toast.error('There was an error updating the project.');
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
