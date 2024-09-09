"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Repository } from "~/prisma/model";

import { createRepository } from "~/actions/mutations/repositories";
import { isApiClientErrorJson } from "~/api";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { RepositoryForm, type RepositoryFormProps } from "./RepositoryForm";

export interface CreateRepositoryFormProps extends Omit<RepositoryFormProps, "action"> {
  readonly onSuccess?: (m: Repository) => void;
  readonly onCancel?: () => void;
}

export const CreateRepositoryForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateRepositoryFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <RepositoryForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        const response = await createRepository({ ...data, skills: data.skills.map(sk => sk.id) });
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("The repository was successfully created.");
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateRepositoryForm;
