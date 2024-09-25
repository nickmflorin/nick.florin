import dynamic from "next/dynamic";

import { type ProjectsControls, type ProjectsFilters } from "~/actions-v2";
import { fetchProjects } from "~/actions-v2/projects/fetch-projects";

import { Loading } from "~/components/loading/Loading";

const ClientProjectsTableBody = dynamic(
  () =>
    import("~/features/projects/components/tables-v2/ProjectsTableBody").then(
      mod => mod.ProjectsTableBody,
    ),
  { loading: () => <Loading isLoading component="tbody" /> },
);

export interface ProjectsTableBodyProps {
  readonly filters: ProjectsFilters;
  readonly page: number;
  readonly ordering: ProjectsControls["ordering"];
}

export const ProjectsTableBody = async ({
  filters,
  page,
  ordering,
}: ProjectsTableBodyProps): Promise<JSX.Element> => {
  const fetcher = fetchProjects(["skills", "repositories"]);
  const { data: projects } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return <ClientProjectsTableBody data={projects} />;
};
