"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Company } from "~/prisma/model";
import { updateCompany } from "~/actions/update-company";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { useForm } from "../generic/hooks/use-form";

import {
  CompanyForm,
  type CompanyFormProps,
  type CompanyFormValues,
  CompanyFormSchema,
} from "./CompanyForm";

export interface UpdateCompanyFormProps extends Omit<CompanyFormProps, "form" | "action"> {
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

  const { setValues, ...form } = useForm<CompanyFormValues>({
    schema: CompanyFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
      websiteUrl: "",
      logoImageUrl: "",
      city: "",
      state: "",
    },
  });

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    setValues({
      ...company,
      shortName: company.shortName ?? "",
      description: company.description ?? "",
      websiteUrl: company.websiteUrl ?? "",
      logoImageUrl: company.logoImageUrl ?? "",
    });
  }, [company, setValues]);

  return (
    <CompanyForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
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
