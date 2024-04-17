"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiRepository } from "~/prisma/model";
import { updateRepository } from "~/actions/mutations/repositories";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { RepositoryForm, type RepositoryFormProps } from "./RepositoryForm";

export interface UpdateRepositoryFormProps extends Omit<RepositoryFormProps, "action"> {
  readonly repository: ApiRepository<["projects", "skills"]>;
  readonly onCancel?: () => void;
}

export const UpdateRepositoryForm = ({
  repository,
  onCancel,
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
      /* Even though these aren't modifiable by the form yet, it is important they be stored with
         the form data so that they are not treated as an empty array which will wipe the previously
         stored data on save. */
      skills: repository.skills.map(sk => sk.id),
    });
  }, [repository, props.form.setValues]);

  return (
    <RepositoryForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        const response = await updateRepositoryWithId(data);
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

export default UpdateRepositoryForm;
