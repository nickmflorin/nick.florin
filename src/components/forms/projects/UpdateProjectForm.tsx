"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Project } from "~/prisma/model";
import { updateProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { ProjectForm, type ProjectFormProps } from "./ProjectForm";

export interface UpdateProjectFormProps extends Omit<ProjectFormProps, "action"> {
  readonly project: Project;
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
      name: project.name,
      slug: project.slug,
      startDate: project.startDate,
      // TODO: Use actual data once established.
      skills: [],
      details: [],
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
