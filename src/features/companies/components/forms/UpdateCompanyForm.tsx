'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Company } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateCompany } from '~/actions/companies/update-company';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { CompanyForm, type CompanyFormProps } from './CompanyForm';

export interface UpdateCompanyFormProps extends Omit<CompanyFormProps, 'action'> {
  readonly company: Company;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateCompanyForm = ({
  company,
  onCancel,
  onSuccess,
  ...props
}: UpdateCompanyFormProps): JSX.Element => {
  const updateCompanyWithId = updateCompany.bind(null, company.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different company is being edited.  Keying the effect on
     the identifier rather than the company itself means a background revalidation of the same
     company never discards values the user is in the middle of editing. */
  const setCompanyFormValues = useEffectEvent(() => {
    props.form.setValues({
      ...company,
      description: company.description ?? '',
      logoImageUrl: company.logoImageUrl ?? '',
      shortName: company.shortName ?? '',
      websiteUrl: company.websiteUrl ?? '',
    });
  });

  useEffect(() => {
    setCompanyFormValues();
  }, [company.id]);

  return (
    <CompanyForm
      {...props}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateCompanyWithId>> | null = null;
        try {
          response = await updateCompanyWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the company with ID '${company.id}'.`,
            { company, data },
          );
          return toast.error('There was an error updating the company.');
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
