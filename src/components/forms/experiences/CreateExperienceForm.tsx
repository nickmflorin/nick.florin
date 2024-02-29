"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { createSkill } from "~/actions/create-skill";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import {
  ExperienceForm,
  ExperienceFormSchema,
  type ExperienceFormProps,
  type ExperienceFormValues,
} from "./ExperienceForm";

export interface CreateExperienceFormProps extends Omit<ExperienceFormProps, "form" | "action"> {
  readonly onCancel?: () => void;
}

export const CreateExperienceForm = ({
  onCancel,
  ...props
}: CreateExperienceFormProps): JSX.Element => {
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

  return (
    <ExperienceForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await createSkill(data);
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

export default CreateExperienceForm;
