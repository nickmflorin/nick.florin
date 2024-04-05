"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Project } from "~/prisma/model";
import { createProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  ProjectForm,
  type ProjectFormProps,
  type ProjectFormValues,
  ProjectFormSchema,
} from "./ProjectForm";

export interface CreateProjectFormProps extends Omit<ProjectFormProps, "form" | "action"> {
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

  const { setValues, ...form } = useForm<ProjectFormValues>({
    schema: ProjectFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
      websiteUrl: "",
      logoImageUrl: "",
      city: "",
      state: "",
    },
  });

  return (
    <ProjectForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await createProject(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("Project successfully created.");
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
