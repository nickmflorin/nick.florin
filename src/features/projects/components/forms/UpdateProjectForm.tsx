"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiProject } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateProject } from "~/actions/projects/update-project";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { ProjectForm, type ProjectFormProps } from "./ProjectForm";

export interface UpdateProjectFormProps extends Omit<ProjectFormProps, "action"> {
  readonly project: ApiProject<["skills", "repositories", "nestedDetails", "details"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateProjectForm = ({
  project,
  onCancel,
  onSuccess,
  ...props
}: UpdateProjectFormProps): JSX.Element => {
  const updateProjectWithId = updateProject.bind(null, project.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...project,
      shortName: project.shortName ?? "",
      repositories: project.repositories.map(r => r.id),
      skills: project.skills.map(sk => sk.id),
      details: project.details.map(d => d.id),
      nestedDetails: project.nestedDetails.map(d => d.id),
    });
  }, [project, props.form.setValues]);

  return (
    <ProjectForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateProjectWithId>> | null = null;
        try {
          response = await updateProjectWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the project with ID '${project.id}'.`,
            { project, data },
          );
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the project.");
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

export default UpdateProjectForm;
