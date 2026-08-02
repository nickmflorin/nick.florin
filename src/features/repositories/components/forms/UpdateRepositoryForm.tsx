'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiRepository } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateRepository } from '~/actions/repositories/update-repository';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { RepositoryForm, type RepositoryFormProps } from './RepositoryForm';

export interface UpdateRepositoryFormProps extends Omit<RepositoryFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly repository: ApiRepository<['projects', 'skills']>;
}

export const UpdateRepositoryForm = ({
  onCancel,
  onSuccess,
  repository,
  ...props
}: UpdateRepositoryFormProps): JSX.Element => {
  const updateRepositoryWithId = updateRepository.bind(null, repository.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different repository is being edited.  Keying the effect on
     the identifier rather than the repository itself means a background revalidation of the same
     repository never discards values the user is in the middle of editing. */
  const setRepositoryFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...repository,
      projects: repository.projects.map(p => p.id),
      skills: repository.skills.map(sk => sk.id),
      slug: repository.slug,
    });
  });

  useEffect(() => {
    setRepositoryFormValues();
  }, [repository.id]);

  return (
    <RepositoryForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateRepositoryWithId>> | null = null;
        try {
          response = await updateRepositoryWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the repository with ID '${repository.id}'.`,
            { data, repository },
          );
          return toast.error('There was an error updating the repository.');
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
