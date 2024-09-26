import { type SkillsFilters } from "~/actions-v2";
import { fetchEducations } from "~/actions-v2/educations/fetch-educations";
import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";
import { fetchProjects } from "~/actions-v2/projects/fetch-projects";
import { fetchRepositories } from "~/actions-v2/repositories/fetch-repositories";

import { SkillsTableFilterBar as ClientSkillsTableFilterBar } from "~/features/skills/components/tables-v2/SkillsTableFilterBar";

export interface SkillsTableFilterBarProps {
  readonly filters: SkillsFilters;
}

export const SkillsTableFilterBar = async ({
  filters,
}: SkillsTableFilterBarProps): Promise<JSX.Element> => {
  const eduFetcher = fetchEducations([]);
  const { data: educations } = await eduFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const expFetcher = fetchExperiences([]);
  const { data: experiences } = await expFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const projFetcher = fetchProjects([]);
  const { data: projects } = await projFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return (
    <ClientSkillsTableFilterBar
      filters={filters}
      educations={educations}
      experiences={experiences}
      repositories={repositories}
      projects={projects}
    />
  );
};
