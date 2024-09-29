"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiEducation } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateEducation } from "~/actions/educations/update-education";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { EducationForm, type EducationFormProps } from "./EducationForm";

export interface UpdateEducationFormProps extends Omit<EducationFormProps, "action"> {
  readonly education: ApiEducation<["skills"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateEducationForm = ({
  education,
  onCancel,
  onSuccess,
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [education]);

  return (
    <EducationForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateEducationWithId>> | null = null;
        try {
          response = await updateEducationWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the education with ID '${education.id}'.`,
            { education, data },
          );
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the education.");
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

export default UpdateEducationForm;
