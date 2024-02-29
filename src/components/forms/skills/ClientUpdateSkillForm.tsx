"use client";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/update-skill";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import { SkillForm, SkillFormSchema, type SkillFormProps, type SkillFormValues } from "./SkillForm";

export interface UpdateSkillFormProps extends Omit<SkillFormProps, "form" | "action"> {
  readonly skill: ApiSkill;
  readonly onCancel?: () => void;
}

export const UpdateSkillForm = ({
  skill,
  onCancel,
  ...props
}: UpdateSkillFormProps): JSX.Element => {
  const updateSkillWithId = updateSkill.bind(null, skill.id);
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

  useEffect(() => {
    setValues({
      ...skill,
      description: skill.description ?? "",
      experiences: skill.experiences.map(exp => exp.id),
      educations: skill.educations.map(edu => edu.id),
    });
  }, [skill, setValues]);

  return (
    <SkillForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      title={skill.label}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateSkillWithId(data);
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

export default UpdateSkillForm;
