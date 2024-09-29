"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiRepository } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateRepository } from "~/actions/repositories/update-repository";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { RepositoryForm, type RepositoryFormProps } from "./RepositoryForm";

export interface UpdateRepositoryFormProps extends Omit<RepositoryFormProps, "action"> {
  readonly repository: ApiRepository<["projects", "skills"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateRepositoryForm = ({
  repository,
  onCancel,
  onSuccess,
  ...props
}: UpdateRepositoryFormProps): JSX.Element => {
  const updateRepositoryWithId = updateRepository.bind(null, repository.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    props.form.setValues({
      ...repository,
      slug: repository.slug,
      projects: repository.projects.map(p => p.id),
      skills: repository.skills.map(sk => sk.id),
    });
  }, [repository, props.form.setValues]);

  return (
    <RepositoryForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof updateRepositoryWithId>> | null = null;
        try {
          response = await updateRepositoryWithId(data);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the repository with ID '${repository.id}'.`,
            { repository, data },
          );
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error updating the repository.");
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

export default UpdateRepositoryForm;
