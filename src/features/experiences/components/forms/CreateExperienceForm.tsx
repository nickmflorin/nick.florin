"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Experience } from "~/database/model";
import { logger } from "~/internal/logger";

import { createExperience } from "~/actions/experiences/create-experience";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { ExperienceForm, type ExperienceFormProps } from "./ExperienceForm";

export interface CreateExperienceFormProps extends Omit<ExperienceFormProps, "action"> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Experience) => void;
}

export const CreateExperienceForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateExperienceFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <ExperienceForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createExperience>> | null = null;
        try {
          response = await createExperience(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the experience'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the experience.");
        }
        const { error, data: experience } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(experience);
        });
      }}
    />
  );
};

export default CreateExperienceForm;
