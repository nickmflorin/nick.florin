import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { useProject } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const ProjectForm = dynamic(() => import("~/components/forms/projects/UpdateProjectForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface UpdateProjectDrawerProps
  extends ExtendingDrawerProps<{
    readonly projectId: string;
  }> {}

export const UpdateProjectDrawer = ({ projectId }: UpdateProjectDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useProject(
    isUuid(projectId) ? projectId : null,
    { keepPreviousData: true },
  );
  return (
    <Drawer className="overflow-y-auto">
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {project => (
          <>
            <DrawerHeader>{project.shortName ?? project.name}</DrawerHeader>
            <DrawerContent>
              <ProjectForm project={project} />
            </DrawerContent>
          </>
        )}
      </ApiResponseState>
    </Drawer>
  );
};

export default UpdateProjectDrawer;
