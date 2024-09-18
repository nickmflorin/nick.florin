"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type School } from "~/database/model";

import { updateSchool } from "~/actions/mutations/schools";
import { isApiClientErrorJson } from "~/api";

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
        const response = await updateSchoolWithId(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          transition(() => {
            refresh();
            onSuccess?.();
          });
        }
      }}
    />
  );
};

export default UpdateSchoolForm;
