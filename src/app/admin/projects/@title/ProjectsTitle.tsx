import { type ProjectsFilters } from '~/actions';
import { fetchProjectsCount } from '~/actions/projects/fetch-projects';

export interface ProjectsTitleProps {
  readonly filters: ProjectsFilters;
}

export const ProjectsTitle = async ({ filters }: ProjectsTitleProps) => {
  const {
    data: { count },
  } = await fetchProjectsCount({ filters, visibility: 'admin' }, { strict: true });
  return <>{count}</>;
};
