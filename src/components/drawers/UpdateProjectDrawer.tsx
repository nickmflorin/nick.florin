import { isUuid } from "~/lib/typeguards";
import type { BrandProject } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useProjectForm } from "~/components/forms/projects/hooks";
import UpdateProjectForm from "~/components/forms/projects/UpdateProjectForm";
import { useProject } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateCourseDrawerProps
  extends ExtendingDrawerProps<{
    readonly projectId: string;
    readonly eager: Pick<BrandProject, "name">;
  }> {}

export const UpdateCourseDrawer = ({ projectId, eager }: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useProject(
    isUuid(projectId) ? projectId : null,
    {
      keepPreviousData: true,
    },
  );
  const form = useProjectForm();

  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {project => <UpdateProjectForm form={form} project={project} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
