import { getProjects } from "~/actions/fetches/projects";
import { ProjectTile } from "~/components/tiles/ProjectTile";

export default async function ProjectsPage() {
  const projects = await getProjects({ visibility: "public", includes: [] });
  return (
    <div className="flex flex-col gap-[12px]">
      {projects.map(project => (
        <ProjectTile project={project} key={project.id} />
      ))}
    </div>
  );
}
