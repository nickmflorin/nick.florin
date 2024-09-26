import { type RepositoriesFilters } from "~/actions-v2";
import { fetchProjects } from "~/actions-v2/projects/fetch-projects";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { RepositoriesTableFilterBar as ClientRepositoriesTableFilterBar } from "~/features/repositories/components/tables-v2/RepositoriesTableFilterBar";

export interface RepositoriesTableFilterBarProps {
  readonly filters: RepositoriesFilters;
}

export const RepositoriesTableFilterBar = async ({
  filters,
}: RepositoriesTableFilterBarProps): Promise<JSX.Element> => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const projectsFetcher = fetchProjects([]);
  const { data: projects } = await projectsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return <ClientRepositoriesTableFilterBar filters={filters} projects={projects} skills={skills} />;
};
