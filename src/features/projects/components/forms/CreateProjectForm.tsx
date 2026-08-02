'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Project } from '~/database/model';
import { logger } from '~/internal/logger';

import { createProject } from '~/actions/projects/create-project';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { ProjectForm, type ProjectFormProps } from './ProjectForm';

export interface CreateProjectFormProps extends Omit<ProjectFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Project) => void;
}

export const CreateProjectForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateProjectFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <ProjectForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createProject>> | null = null;
        try {
          response = await createProject(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the project'.", {
            data,
          });
          return toast.error('There was an error creating the project.');
        }
        const { data: project, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(project);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
