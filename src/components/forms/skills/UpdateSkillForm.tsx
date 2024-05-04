"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { SkillForm, type SkillFormProps } from "./SkillForm";

export interface UpdateSkillFormProps extends Omit<SkillFormProps, "action"> {
  readonly skill: ApiSkill<["educations", "experiences", "projects", "repositories", "courses"]>;
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

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...skill,
      description: skill.description ?? "",
      experiences: skill.experiences.map(exp => exp.id),
      educations: skill.educations.map(edu => edu.id),
      projects: skill.projects.map(proj => proj.id),
      repositories: skill.repositories.map(repo => repo.id),
      courses: skill.courses.map(course => course.id),
    });
  }, [skill, props.form.setValues]);

  return (
    <SkillForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        const response = await updateSkillWithId(data);
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

export default UpdateSkillForm;
