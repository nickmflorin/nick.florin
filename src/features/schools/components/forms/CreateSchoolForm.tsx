"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type School } from "~/database/model";
import { logger } from "~/internal/logger";

import { createSchool } from "~/actions/schools/create-school";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { SchoolForm, type SchoolFormProps } from "./SchoolForm";

export interface CreateSchoolFormProps extends Omit<SchoolFormProps, "action"> {
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

  return (
    <SchoolForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createSchool>> | null = null;
        try {
          response = await createSchool(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the school'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the school.");
        }
        const { error, data: school } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          form.reset();
          refresh();
          onSuccess?.(school);
        });
      }}
    />
  );
};

export default CreateSchoolForm;
