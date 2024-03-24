"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Education } from "~/prisma/model";
import { createEducation } from "~/actions/create-education";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  EducationForm,
  EducationFormSchema,
  type EducationFormProps,
  type EducationFormValues,
} from "./EducationForm";

export interface CreateEducationFormProps extends Omit<EducationFormProps, "form" | "action"> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Education) => void;
}

export const CreateEducationForm = ({
  onCancel,
  onSuccess,
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
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateEducationForm;
