import type { BrandProject } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useProjectForm } from "~/features/projects/components/forms/hooks";
import UpdateProjectForm from "~/features/projects/components/forms/UpdateProjectForm";
import { useProject } from "~/hooks/api";

interface UpdateProjectDrawerProps extends ExtendingDrawerProps {
  readonly projectId: string;
  readonly eager: Pick<BrandProject, "name">;
}

export const UpdateProjectDrawer = ({
  projectId,
  eager,
  onClose,
}: UpdateProjectDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useProject(projectId, {
    keepPreviousData: true,
    query: {
      /* Note: We are not using skills, details or nested details in the Form yet, but since the
         action to update the project is already implemented, we need to include those in the
         Form data (not the Form inputs) so that they are not wiped everytime a project is
         updated. */
      includes: ["skills", "repositories", "details", "nestedDetails"],
      visibility: "admin",
    },
  });
  const form = useProjectForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {project => (
          <UpdateProjectForm
            form={form}
            project={project}
            onSuccess={() => onClose()}
            onCancel={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateProjectDrawer;
