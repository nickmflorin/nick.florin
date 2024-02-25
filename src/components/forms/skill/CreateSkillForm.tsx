"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { createSkill } from "~/actions/createSkill";

import { useForm } from "../useForm";

import { SkillForm, SkillFormSchema, type SkillFormProps, type SkillFormValues } from "./SkillForm";

export interface CreateSkillFormProps extends Omit<SkillFormProps, "form" | "action"> {}

export const CreateSkillForm = (props: CreateSkillFormProps): JSX.Element => {
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
