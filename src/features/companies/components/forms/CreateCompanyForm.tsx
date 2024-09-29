"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Company } from "~/database/model";
import { logger } from "~/internal/logger";

import { createCompany } from "~/actions-v2/companies/create-company";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { CompanyForm, type CompanyFormProps } from "./CompanyForm";

export interface CreateCompanyFormProps extends Omit<CompanyFormProps, "action"> {
  readonly onSuccess?: (m: Company) => void;
  readonly onCancel?: () => void;
}

export const CreateCompanyForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateCompanyFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <CompanyForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createCompany>> | null = null;
        try {
          response = await createCompany(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the company'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the company.");
        }
        const { error, data: company } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(company);
        });
      }}
    />
  );
};

export default CreateCompanyForm;
