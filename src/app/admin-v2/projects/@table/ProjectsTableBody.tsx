import dynamic from "next/dynamic";

import { type ProjectsControls, type ProjectsFilters } from "~/actions-v2";
import { fetchProjects } from "~/actions-v2/projects/fetch-projects";

import { Loading } from "~/components/loading/Loading";
import { ProjectsTableControlBarPlaceholder } from "~/features/projects/components/tables-v2/ProjectsTableControlBarPlaceholder";

const ClientProjectsTableBody = dynamic(
  () =>
    import("~/features/projects/components/tables-v2/ProjectsTableBody").then(
      mod => mod.ProjectsTableBody,
    ),
  {
    loading: () => (
      <>
        <ProjectsTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getProjects = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: ProjectsFilters;
  readonly page: number;
  readonly ordering: ProjectsControls["ordering"];
}) => {
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
  return projects;
};

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
  const projects = await getProjects({ page, filters, ordering });
  return <ClientProjectsTableBody data={projects} />;
};
