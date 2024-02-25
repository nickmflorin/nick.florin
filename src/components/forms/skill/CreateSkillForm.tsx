"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { createSkill } from "~/actions/createSkill";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import { SkillForm, SkillFormSchema, type SkillFormProps, type SkillFormValues } from "./SkillForm";

export interface CreateSkillFormProps extends Omit<SkillFormProps, "form" | "action"> {
  readonly onCancel?: () => void;
}

export const CreateSkillForm = ({ onCancel, ...props }: CreateSkillFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<SkillFormValues>({
    schema: SkillFormSchema,
    defaultValues: {
      label: "",
      slug: "",
      description: "",
      experiences: [],
      educations: [],
      categories: [],
      programmingDomains: [],
      programmingLanguages: [],
      includeInTopSkills: false,
      experience: null,
      visible: true,
    },
  });

  return (
    <SkillForm
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

export default CreateSkillForm;
