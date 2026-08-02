'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Company } from '~/database/model';
import { logger } from '~/internal/logger';

import { createCompany } from '~/actions/companies/create-company';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { CompanyForm, type CompanyFormProps } from './CompanyForm';

export interface CreateCompanyFormProps extends Omit<CompanyFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Company) => void;
}

export const CreateCompanyForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateCompanyFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <CompanyForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createCompany>> | null = null;
        try {
          response = await createCompany(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the company'.", {
            data,
          });
          return toast.error('There was an error creating the company.');
        }
        const { data: company, error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(company);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      isLoading={pending}
    />
  );
};
