import { isUuid } from "~/lib/typeguards";
import type { BrandProject } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useProjectForm } from "~/components/forms/projects/hooks";
import UpdateProjectForm from "~/components/forms/projects/UpdateProjectForm";
import { useProject } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateProjectDrawerProps
  extends ExtendingDrawerProps<{
    readonly projectId: string;
    readonly eager: Pick<BrandProject, "name">;
  }> {}

export const UpdateProjectDrawer = ({
  projectId,
  eager,
}: UpdateProjectDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useProject(
    isUuid(projectId) ? projectId : null,
    {
      keepPreviousData: true,
      query: {
        visibility: "admin",
        /* Note: We are not using skills, details or nested details in the Form yet, but since the
           action to update the project is already implemented, we need to include those in the
           Form data (not the Form inputs) so that they are not wiped everytime a project is
           updated. */
        includes: ["skills", "repositories", "details", "nestedDetails"],
      },
    },
  );
  const form = useProjectForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {project => <UpdateProjectForm form={form} project={project} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateProjectDrawer;
