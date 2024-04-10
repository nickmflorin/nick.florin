"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Company } from "~/prisma/model";
import { updateCompany } from "~/actions/mutations/companies";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { CompanyForm, type CompanyFormProps } from "./CompanyForm";

export interface UpdateCompanyFormProps extends Omit<CompanyFormProps, "action"> {
  readonly company: Company;
  readonly onCancel?: () => void;
}

export const UpdateCompanyForm = ({
  company,
  onCancel,
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
        const response = await updateCompanyWithId(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default UpdateCompanyForm;
