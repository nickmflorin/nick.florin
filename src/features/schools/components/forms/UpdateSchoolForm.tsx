"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type School } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateSchool } from "~/actions/schools/update-school";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { SchoolForm, type SchoolFormProps } from "./SchoolForm";

export interface UpdateSchoolFormProps extends Omit<SchoolFormProps, "action"> {
  readonly school: School;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateSchoolForm = ({
  school,
  onCancel,
  onSuccess,
  ...props
}: UpdateSchoolFormProps): JSX.Element => {
  const updateSchoolWithId = updateSchool.bind(null, school.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...school,
      shortName: school.shortName ?? "",
      description: school.description ?? "",
      websiteUrl: school.websiteUrl ?? "",
      logoImageUrl: school.logoImageUrl ?? "",
    });
  }, [school, props.form.setValues]);

  return (
    <SchoolForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateSchoolWithId>> | null = null;
        try {
          response = await updateSchoolWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the school with ID '${school.id}'.`, {
            school,
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the school.");
        }
        const { error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.();
        });
      }}
    />
  );
};

export default UpdateSchoolForm;
