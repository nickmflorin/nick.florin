"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiExperience } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateExperience } from "~/actions/experiences/update-experience";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { ExperienceForm, type ExperienceFormProps } from "./ExperienceForm";

export interface UpdateExperienceFormProps extends Omit<ExperienceFormProps, "action"> {
  readonly experience: ApiExperience<["skills"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateExperienceForm = ({
  experience,
  onCancel,
  onSuccess,
  ...props
}: UpdateExperienceFormProps): JSX.Element => {
  const updateExperienceWithId = updateExperience.bind(null, experience.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...experience,
      skills: experience.skills.map(s => s.id),
      company: experience.companyId,
      description: experience.description ?? "",
    });
  }, [experience, props.form.setValues]);

  return (
    <ExperienceForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateExperienceWithId>> | null = null;
        try {
          response = await updateExperienceWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the experience with ID '${experience.id}'.`,
            { experience, data },
          );
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the experience.");
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

export default UpdateExperienceForm;
