'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Repository } from '~/database/model';
import { logger } from '~/internal/logger';

import { createRepository } from '~/actions/repositories/create-repository';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { RepositoryForm, type RepositoryFormProps } from './RepositoryForm';

export interface CreateRepositoryFormProps extends Omit<RepositoryFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Repository) => void;
}

export const CreateRepositoryForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateRepositoryFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <RepositoryForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createRepository>> | null = null;
        try {
          response = await createRepository(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the repository'.", {
            data,
          });
          return toast.error('There was an error creating the repository.');
        }
        const { data: repository, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(repository);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
