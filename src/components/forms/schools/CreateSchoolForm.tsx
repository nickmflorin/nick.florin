"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type School } from "~/prisma/model";
import { createSchool } from "~/actions/mutations/create-school";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  SchoolForm,
  type SchoolFormProps,
  type SchoolFormValues,
  SchoolFormSchema,
} from "./SchoolForm";

export interface CreateSchoolFormProps extends Omit<SchoolFormProps, "form" | "action"> {
  readonly onSuccess?: (m: School) => void;
  readonly onCancel?: () => void;
}

export const CreateSchoolForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateSchoolFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<SchoolFormValues>({
    schema: SchoolFormSchema,
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
    <SchoolForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await createSchool(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("School successfully created.");
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateSchoolForm;
