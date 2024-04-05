"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Project } from "~/prisma/model";
import { updateProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { useForm } from "../generic/hooks/use-form";

import {
  ProjectForm,
  type ProjectFormProps,
  type ProjectFormValues,
  ProjectFormSchema,
} from "./ProjectForm";

export interface UpdateProjectFormProps extends Omit<ProjectFormProps, "form" | "action"> {
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

  const { setValues, ...form } = useForm<ProjectFormValues>({
    schema: ProjectFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    setValues({
      ...project,
      shortName: project.shortName ?? "",
      name: project.name ?? "",
      slug: project.slug ?? "",
      startDate: project.startDate ?? new Date(),
      // TODO: Use actual data once established.
      skills: [],
      details: [],
    });
  }, [project, setValues]);

  return (
    <ProjectForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
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
