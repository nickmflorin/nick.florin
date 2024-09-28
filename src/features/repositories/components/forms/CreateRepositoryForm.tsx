"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Repository } from "~/database/model";
import { logger } from "~/internal/logger";

import { createRepository } from "~/actions-v2/repositories/create-repository";

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
        let response: Awaited<ReturnType<typeof createRepository>> | null = null;
        try {
          response = await createRepository(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the repository'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the repository.");
        }
        const { error, data: repository } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(repository);
        });
      }}
    />
  );
};

export default CreateRepositoryForm;
