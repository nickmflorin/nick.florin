"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiExperience } from "~/prisma/model";

import { updateExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { ExperienceForm, type ExperienceFormProps } from "./ExperienceForm";

export interface UpdateExperienceFormProps extends Omit<ExperienceFormProps, "action"> {
  readonly experience: ApiExperience<["skills"]>;
  readonly onCancel?: () => void;
}

export const UpdateExperienceForm = ({
  experience,
  onCancel,
  ...props
}: UpdateExperienceFormProps): JSX.Element => {
  const updateExperienceWithId = updateExperience.bind(null, experience.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...experience,
      skills: experience.skills.map(s => ({ id: s.id, label: s.label, value: s.id })),
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
        const response = await updateExperienceWithId({
          ...data,
          skills: data.skills.map(sk => sk.id),
        });
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

export default UpdateExperienceForm;
