import { getRepositories } from "~/actions/fetches/repositories";
import { type ProjectsFilters } from "~/actions-v2";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { ProjectsTableFilterBar as ClientProjectsTableFilterBar } from "~/features/projects/components/tables-v2/ProjectsTableFilterBar";

export interface ProjectsTableFilterBarProps {
  readonly filters: ProjectsFilters;
}

export const ProjectsTableFilterBar = async ({
  filters,
}: ProjectsTableFilterBarProps): Promise<JSX.Element> => {
  const fetcher = fetchSkills([]);
  const { data: skills } = await fetcher({ visibility: "admin", filters: {} }, { strict: true });
  const repositories = await getRepositories({ visibility: "admin", includes: [] });
  return (
    <ClientProjectsTableFilterBar filters={filters} repositories={repositories} skills={skills} />
  );
};
