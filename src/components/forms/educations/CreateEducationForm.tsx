"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { createEducation } from "~/actions/create-education";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import {
  EducationForm,
  EducationFormSchema,
  type EducationFormProps,
  type EducationFormValues,
} from "./EducationForm";

export interface CreateEducationFormProps extends Omit<EducationFormProps, "form" | "action"> {
  readonly onCancel?: () => void;
}

export const CreateEducationForm = ({
  onCancel,
  ...props
}: CreateEducationFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<EducationFormValues>({
    schema: EducationFormSchema,
    defaultValues: {
      major: "",
      concentration: "",
      note: "",
      minor: "",
      description: "",
      postPoned: false,
      startDate: new Date(),
      endDate: null,
    },
  });

  return (
    <EducationForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await createEducation(data);
        if (isApiClientErrorResponse(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateEducationForm;
