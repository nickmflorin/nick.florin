"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Experience } from "~/prisma/model";

import { createExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";

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
        const response = await createExperience(data);
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

export default CreateExperienceForm;
