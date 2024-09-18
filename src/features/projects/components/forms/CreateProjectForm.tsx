"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Project } from "~/database/model";

import { createProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";

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
        const response = await createProject(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("The project was successfully created.");
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateProjectForm;
