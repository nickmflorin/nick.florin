import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type ProjectsControls, type ProjectsFilters } from '~/actions';
import { fetchProjects } from '~/actions/projects/fetch-projects';

import { Loading } from '~/components/loading/Loading';
import { ProjectsTableControlBarPlaceholder } from '~/features/projects/components/tables/ProjectsTableControlBarPlaceholder';

const ClientProjectsTableBody = dynamic(
  () =>
    import('~/features/projects/components/tables/ProjectsTableBody').then(
      mod => mod.ProjectsTableBody,
    ),
  {
    loading: () => (
      <>
        <ProjectsTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

const getProjects = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: ProjectsFilters;
  readonly ordering: ProjectsControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchProjects(['skills', 'repositories']);
  const { data: projects } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return projects;
};

export interface ProjectsTableBodyProps {
  readonly filters: ProjectsFilters;
  readonly ordering: ProjectsControls['ordering'];
  readonly page: number;
}

export const ProjectsTableBody = async ({
  filters,
  ordering,
  page,
}: ProjectsTableBodyProps): Promise<JSX.Element> => {
  const projects = await getProjects({ filters, ordering, page });
  return <ClientProjectsTableBody data={projects} />;
};
