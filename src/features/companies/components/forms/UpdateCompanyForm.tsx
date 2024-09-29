"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Company } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateCompany } from "~/actions-v2/companies/update-company";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { CompanyForm, type CompanyFormProps } from "./CompanyForm";

export interface UpdateCompanyFormProps extends Omit<CompanyFormProps, "action"> {
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
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...company,
      shortName: company.shortName ?? "",
      description: company.description ?? "",
      websiteUrl: company.websiteUrl ?? "",
      logoImageUrl: company.logoImageUrl ?? "",
    });
  }, [company, props.form.setValues]);

  return (
    <CompanyForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
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
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the company.");
        }
        const { error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.();
        });
      }}
    />
  );
};

export default UpdateCompanyForm;
