"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Project } from "~/database/model";
import { logger } from "~/internal/logger";

import { createProject } from "~/actions/projects/create-project";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { ProjectForm, type ProjectFormProps } from "./ProjectForm";

export interface CreateProjectFormProps extends Omit<ProjectFormProps, "action"> {
  readonly onSuccess?: (m: Project) => void;
  readonly onCancel?: () => void;
}

export const CreateProjectForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateProjectFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <ProjectForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createProject>> | null = null;
        try {
          response = await createProject(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the project'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the project.");
        }
        const { error, data: project } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(project);
        });
      }}
    />
  );
};

export default CreateProjectForm;
