import { Loading } from "~/components/loading/Loading";
import { ProjectsTableControlBarPlaceholder } from "~/features/projects/components/tables-v2/ProjectsTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <ProjectsTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
