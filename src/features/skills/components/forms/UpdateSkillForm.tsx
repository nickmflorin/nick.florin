"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/skills/update-skill";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { SkillForm, type SkillFormProps } from "./SkillForm";

export interface UpdateSkillFormProps extends Omit<SkillFormProps, "action"> {
  readonly skill: ApiSkill<["educations", "experiences", "projects", "repositories", "courses"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateSkillForm = ({
  skill,
  onCancel,
  onSuccess,
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
        let response: Awaited<ReturnType<typeof updateSkillWithId>> | null = null;
        try {
          response = await updateSkillWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the skill with ID '${skill.id}'.`, {
            skill,
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the skill.");
        }
        const { error } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.();
        });
      }}
    />
  );
};

export default UpdateSkillForm;
