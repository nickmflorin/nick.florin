import { fetchProjects } from "~/actions-v2/projects/fetch-projects";

import { ProjectTile } from "~/features/projects/components/ProjectTile";

export default async function ProjectsPage() {
  const fetcher = fetchProjects([]);
  const { data: projects } = await fetcher(
    {
      visibility: "public",
      filters: { highlighted: true },
    },
    { strict: true },
  );
  return (
    <>
      {projects.map(project => (
        <ProjectTile project={project} key={project.id} />
      ))}
    </>
  );
}
