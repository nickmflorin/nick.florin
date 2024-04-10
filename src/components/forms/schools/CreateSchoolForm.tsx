"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type School } from "~/prisma/model";
import { createSchool } from "~/actions/mutations/schools";
import { isApiClientErrorJson } from "~/api";
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
