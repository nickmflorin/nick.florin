"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { type ApiEducation } from "~/prisma/model";
import { updateEducation } from "~/actions/update-education";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { useForm } from "../generic/hooks/use-form";

import {
  EducationForm,
  EducationFormSchema,
  type EducationFormProps,
  type EducationFormValues,
} from "./EducationForm";

export interface UpdateEducationFormProps extends Omit<EducationFormProps, "form" | "action"> {
  readonly education: ApiEducation;
  readonly onCancel?: () => void;
}

export const UpdateEducationForm = ({
  education,
  onCancel,
  ...props
}: UpdateEducationFormProps): JSX.Element => {
  const updateEducationWithId = updateEducation.bind(null, education.id);
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

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    setValues({
      ...education,
      school: education.schoolId,
      description: education.description ?? "",
      concentration: education.concentration ?? "",
      minor: education.minor ?? "",
      note: education.note ?? "",
    });
  }, [education, setValues]);

  return (
    <EducationForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      title={education.major}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateEducationWithId(data);
        if (isApiClientErrorResponse(response)) {
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

export default UpdateEducationForm;
