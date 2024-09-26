import { type ProjectsFilters } from "~/actions-v2";
import { fetchRepositories } from "~/actions-v2/repositories/fetch-repositories";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { ProjectsTableFilterBar as ClientProjectsTableFilterBar } from "~/features/projects/components/tables-v2/ProjectsTableFilterBar";

export interface ProjectsTableFilterBarProps {
  readonly filters: ProjectsFilters;
}

export const ProjectsTableFilterBar = async ({
  filters,
}: ProjectsTableFilterBarProps): Promise<JSX.Element> => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return (
    <ClientProjectsTableFilterBar filters={filters} repositories={repositories} skills={skills} />
  );
};
