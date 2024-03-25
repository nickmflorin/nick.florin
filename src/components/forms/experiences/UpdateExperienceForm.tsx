"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiExperience } from "~/prisma/model";
import { updateExperience } from "~/actions/mutations/update-experience";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

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

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
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
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateExperienceWithId(data);
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
