"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Company } from "~/prisma/model";
import { createCompany } from "~/actions/mutations/create-company";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  CompanyForm,
  type CompanyFormProps,
  type CompanyFormValues,
  CompanyFormSchema,
} from "./CompanyForm";

export interface CreateCompanyFormProps extends Omit<CompanyFormProps, "form" | "action"> {
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

  return (
    <CompanyForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
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
