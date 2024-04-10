"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Education } from "~/prisma/model";
import { createEducation } from "~/actions/mutations/educations";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { EducationForm, type EducationFormProps } from "./EducationForm";

export interface CreateEducationFormProps extends Omit<EducationFormProps, "action"> {
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

  return (
    <EducationForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
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
