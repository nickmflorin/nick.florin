"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiProject } from "~/database/model";

import { updateProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { ProjectForm, type ProjectFormProps } from "./ProjectForm";

export interface UpdateProjectFormProps extends Omit<ProjectFormProps, "action"> {
  readonly project: ApiProject<["skills", "repositories", "nestedDetails", "details"]>;
  readonly onCancel?: () => void;
}

export const UpdateProjectForm = ({
  project,
  onCancel,
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
        const response = await updateProjectWithId(data);
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

export default UpdateProjectForm;
