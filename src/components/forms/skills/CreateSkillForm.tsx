"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Skill } from "~/prisma/model";
import { createSkill } from "~/actions/mutations/create-skill";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import { SkillForm, SkillFormSchema, type SkillFormProps, type SkillFormValues } from "./SkillForm";

export interface CreateSkillFormProps extends Omit<SkillFormProps, "form" | "action"> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Skill) => void;
}

export const CreateSkillForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateSkillFormProps): JSX.Element => {
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
      projects: [],
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

export default CreateSkillForm;
