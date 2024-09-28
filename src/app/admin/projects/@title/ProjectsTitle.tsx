import { type ProjectsFilters } from "~/actions-v2";
import { fetchProjectsCount } from "~/actions-v2/projects/fetch-projects";

export interface ProjectsTitleProps {
  readonly filters: ProjectsFilters;
}

export const ProjectsTitle = async ({ filters }: ProjectsTitleProps) => {
  const {
    data: { count },
  } = await fetchProjectsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
