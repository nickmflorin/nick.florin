"use client";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { type ApiExperience } from "~/prisma/model";
import { updateExperience } from "~/actions/update-experience";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  ExperienceForm,
  ExperienceFormSchema,
  type ExperienceFormProps,
  type ExperienceFormValues,
} from "./ExperienceForm";

export interface UpdateExperienceFormProps extends Omit<ExperienceFormProps, "form" | "action"> {
  readonly experience: ApiExperience;
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

  const { setValues, ...form } = useForm<ExperienceFormValues>({
    schema: ExperienceFormSchema,
    defaultValues: {
      title: "",
      shortTitle: "",
      description: "",
      isRemote: false,
      startDate: new Date(),
      endDate: null,
    },
  });

  useEffect(() => {
    setValues({
      ...experience,
      company: experience.companyId,
      description: experience.description ?? "",
    });
  }, [experience, setValues]);

  return (
    <ExperienceForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      title={experience.title}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateExperienceWithId(data);
        if (isApiClientErrorResponse(response)) {
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
