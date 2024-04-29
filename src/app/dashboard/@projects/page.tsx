import { getProjects } from "~/actions/fetches/projects";
import { ProjectTile } from "~/components/tiles/ProjectTile";

export default async function ProjectsPage() {
  const projects = await getProjects({ visibility: "public", includes: [] });
  return (
    <>
      {projects.map(project => (
        <ProjectTile project={project} key={project.id} />
      ))}
    </>
  );
}
