"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiEducation } from "~/prisma/model";
import { updateEducation } from "~/actions/mutations/educations";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { EducationForm, type EducationFormProps } from "./EducationForm";

export interface UpdateEducationFormProps extends Omit<EducationFormProps, "action"> {
  readonly education: ApiEducation<["skills"]>;
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

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...education,
      school: education.schoolId,
      skills: education.skills.map(s => s.id),
      description: education.description ?? "",
      concentration: education.concentration ?? "",
      minor: education.minor ?? "",
      note: education.note ?? "",
    });
  }, [education, props.form.setValues]);

  return (
    <EducationForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        const response = await updateEducationWithId(data);
        if (isApiClientErrorJson(response)) {
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
