"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Company } from "~/database/model";

import { createCompany } from "~/actions/mutations/companies";
import { isApiClientErrorJson } from "~/api";

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
        const response = await createCompany(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("Company successfully created.");
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateCompanyForm;
