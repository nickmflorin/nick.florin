import { fetchProjects } from '~/actions/projects/fetch-projects';

import { ProjectTile } from '~/features/projects/components/ProjectTile';

const ProjectsPage = async () => {
  const fetcher = fetchProjects([]);
  const { data: projects } = await fetcher(
    {
      filters: { highlighted: true },
      visibility: 'public',
    },
    { strict: true },
  );
  return (
    <>
      {projects.map(project => (
        <ProjectTile key={project.id} project={project} />
      ))}
    </>
  );
};

export default ProjectsPage;
