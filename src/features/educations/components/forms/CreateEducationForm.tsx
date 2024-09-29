"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Education } from "~/database/model";
import { logger } from "~/internal/logger";

import { createEducation } from "~/actions/educations/create-education";

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
        let response: Awaited<ReturnType<typeof createEducation>> | null = null;
        try {
          response = await createEducation(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the education'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the education.");
        }
        const { error, data: education } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(education);
        });
      }}
    />
  );
};

export default CreateEducationForm;
